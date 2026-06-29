import React, { useState, useRef } from 'react';

const BarChart = ({ data = [], heightClass = 'h-56' }) => {
  const containerRef = useRef(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // If no data or data is empty
  if (!data || data.length === 0) {
    return (
      <div className={`w-full ${heightClass} flex items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 text-slate-400 text-xs font-medium`}>
        Tidak ada data visualisasi tersedia.
      </div>
    );
  }

  // Find max value for scaling (min maxVal is 1)
  const maxVal = Math.max(...data.map(d => d.value), 1);

  // Dimensions of SVG canvas
  const width = 600;
  const height = 200;

  // Chart padding/margins inside SVG coordinates
  const paddingLeft = 45;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const barSpacing = chartWidth / data.length;
  // Dynamic bar width with a maximum of 24px and minimum of 6px
  const barWidth = Math.max(6, Math.min(24, barSpacing * 0.55));

  // Generate coordinates for each bar
  const points = data.map((d, idx) => {
    const x = paddingLeft + (idx * barSpacing) + (barSpacing - barWidth) / 2;
    const barHeight = (d.value / maxVal) * chartHeight;
    const y = paddingTop + chartHeight - barHeight;
    return { x, y, barHeight, value: d.value, label: d.label };
  });

  // Generate grid levels based on maxVal
  const yTicks = maxVal <= 3
    ? Array.from({ length: maxVal + 1 }, (_, i) => maxVal - i)
    : [maxVal, Math.round(maxVal * 0.66), Math.round(maxVal * 0.33), 0];

  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Convert client coordinate ratio back to SVG dimensions
    const svgX = (mouseX / rect.width) * width;
    
    let closestIdx = 0;
    let minDiff = Infinity;
    
    points.forEach((p, idx) => {
      const centerBarX = p.x + barWidth / 2;
      const diff = Math.abs(centerBarX - svgX);
      if (diff < minDiff) {
        minDiff = diff;
        closestIdx = idx;
      }
    });
    
    setHoveredIndex(closestIdx);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div 
      ref={containerRef}
      className={`relative w-full ${heightClass} select-none`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <svg 
        viewBox={`0 0 ${width} ${height}`} 
        className="w-full h-full overflow-visible"
      >
        <defs>
          <linearGradient id="bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#74aa93" />
            <stop offset="100%" stopColor="#46645d" />
          </linearGradient>
          <linearGradient id="bar-grad-hover" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#88bda4" />
            <stop offset="100%" stopColor="#659287" />
          </linearGradient>
        </defs>

        {/* Horizontal Gridlines & Y-Axis Labels */}
        {yTicks.map((tick, i) => {
          const yTick = paddingTop + chartHeight - (tick / maxVal) * chartHeight;
          return (
            <g key={i} className="opacity-70">
              <line 
                x1={paddingLeft} 
                y1={yTick} 
                x2={width - paddingRight} 
                y2={yTick} 
                stroke="#e2e8f0" 
                strokeDasharray="4 4" 
                strokeWidth={1}
              />
              <text 
                x={paddingLeft - 8} 
                y={yTick + 3} 
                textAnchor="end" 
                className="text-[9px] fill-slate-400 font-bold font-mono"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Highlight Backdrop Column on Hover */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <rect
            x={paddingLeft + (hoveredIndex * barSpacing)}
            y={paddingTop}
            width={barSpacing}
            height={chartHeight}
            fill="#f1f5f9"
            opacity={0.5}
            rx={4}
            className="transition-all duration-150"
          />
        )}

        {/* Columns/Bars rendering */}
        {points.map((p, idx) => {
          const isHovered = hoveredIndex === idx;
          // Minimum visible height for 0-value bars so they look clean, or 0 if they really have nothing
          const displayHeight = p.barHeight > 0 ? Math.max(3, p.barHeight) : 0;
          const displayY = paddingTop + chartHeight - displayHeight;

          return (
            <rect
              key={idx}
              x={p.x}
              y={displayY}
              width={barWidth}
              height={displayHeight}
              rx={Math.min(4, barWidth / 2)}
              fill={isHovered ? 'url(#bar-grad-hover)' : 'url(#bar-grad)'}
              className="transition-all duration-300 ease-out cursor-pointer"
            />
          );
        })}

        {/* X-Axis Labels (Display labels selectively if there are too many columns) */}
        {points.map((p, idx) => {
          const showLabel = data.length <= 10 || idx % 2 === 0;
          if (!showLabel) return null;

          return (
            <text 
              key={idx} 
              x={p.x + barWidth / 2} 
              y={height - 8} 
              textAnchor="middle" 
              className="text-[9px] fill-slate-400 font-semibold"
            >
              {p.label}
            </text>
          );
        })}
      </svg>

      {/* HTML Floating Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div 
          className="absolute z-30 p-2.5 bg-slate-900/90 text-white rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-sm pointer-events-none text-xs flex flex-col gap-0.5"
          style={{
            left: `${((points[hoveredIndex].x + barWidth / 2) / width) * 100}%`,
            top: `${(points[hoveredIndex].y) / height * 100}%`,
            transform: 'translate(-50%, -125%)',
            transition: 'left 0.1s ease-out, top 0.1s ease-out',
          }}
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {data[hoveredIndex].label}
          </span>
          <span className="font-extrabold text-teal-300">
            {data[hoveredIndex].value} Booking
          </span>
          {data[hoveredIndex].secondaryValue !== undefined && (
            <span className="text-[10px] text-slate-200 font-medium">
              Vol: Rp {new Intl.NumberFormat('id-ID').format(data[hoveredIndex].secondaryValue)}
            </span>
          )}
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900/90 border-r border-b border-slate-700/50 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default BarChart;
