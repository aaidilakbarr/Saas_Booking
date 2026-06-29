import React, { useState, useRef } from 'react';

const AreaChart = ({ data = [], heightClass = 'h-56' }) => {
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

  // Find max value for scaling (min maxVal is 100k to prevent divide-by-zero or flat charts)
  const maxVal = Math.max(...data.map(d => d.value), 100000);

  // Formatting currency in Indonesian compact style (e.g. Rp 1,5 Jt)
  const formatCurrencyCompact = (value) => {
    if (value === 0) return 'Rp 0';
    if (value >= 1000000000) {
      return 'Rp ' + (value / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M';
    }
    if (value >= 1000000) {
      return 'Rp ' + (value / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt';
    }
    if (value >= 1000) {
      return 'Rp ' + (value / 1000).toLocaleString('id-ID', { maximumFractionDigits: 0 }) + ' Rb';
    }
    return 'Rp ' + value.toLocaleString('id-ID');
  };

  // Dimensions of SVG canvas
  const width = 600;
  const height = 220;

  // Chart padding/margins inside SVG coordinates
  const paddingLeft = 65;
  const paddingRight = 16;
  const paddingTop = 20;
  const paddingBottom = 30;
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // Calculate coordinates for each data point
  const points = data.map((d, idx) => {
    const x = data.length > 1
      ? paddingLeft + (idx * (chartWidth / (data.length - 1)))
      : paddingLeft + chartWidth / 2;
    const y = paddingTop + chartHeight - (d.value / maxVal) * chartHeight;
    return { x, y, value: d.value, label: d.label };
  });

  // SVG Line path construction
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // SVG Area path construction (closing path at the bottom coordinates)
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${paddingTop + chartHeight} L ${points[0].x} ${paddingTop + chartHeight} Z`
    : '';

  // Generate 4 Y-axis grid tick levels (0%, 33.3%, 66.6%, 100%)
  const yTicks = [maxVal, maxVal * 2 / 3, maxVal * 1 / 3, 0];

  const handleMouseMove = (e) => {
    if (!containerRef.current || points.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Convert client coordinate ratio back to the SVG width dimension (600)
    const svgX = (mouseX / rect.width) * width;
    
    let closestIdx = 0;
    let minDiff = Infinity;
    
    points.forEach((p, idx) => {
      const diff = Math.abs(p.x - svgX);
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
          <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#659287" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#659287" stopOpacity="0.0" />
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
                x={paddingLeft - 10} 
                y={yTick + 3.5} 
                textAnchor="end" 
                className="text-[9px] fill-slate-400 font-semibold font-mono"
              >
                {formatCurrencyCompact(tick)}
              </text>
            </g>
          );
        })}

        {/* Vertical Guide Line on Hover */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <line 
            x1={points[hoveredIndex].x} 
            y1={paddingTop} 
            x2={points[hoveredIndex].x} 
            y2={paddingTop + chartHeight} 
            stroke="#659287" 
            strokeDasharray="3 3" 
            strokeWidth={1.5} 
            className="opacity-60"
          />
        )}

        {/* Shaded Area Under Curve */}
        {areaPath && (
          <path 
            d={areaPath} 
            fill="url(#area-grad)" 
            className="transition-all duration-300 ease-out"
          />
        )}

        {/* Solid Line Curve */}
        {linePath && (
          <path 
            d={linePath} 
            fill="none" 
            stroke="#659287" 
            strokeWidth={3} 
            strokeLinecap="round" 
            strokeLinejoin="round"
            className="transition-all duration-300 ease-out"
          />
        )}

        {/* Circle Dots for Vertices */}
        {points.map((p, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <g key={idx}>
              {isHovered && (
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r={8} 
                  fill="#659287" 
                  opacity={0.2} 
                  className="transition-all duration-150"
                />
              )}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={isHovered ? 5.5 : 4} 
                fill="#ffffff" 
                stroke="#659287" 
                strokeWidth={isHovered ? 2.5 : 2} 
                className="transition-all duration-150 cursor-pointer shadow-sm"
              />
            </g>
          );
        })}

        {/* X-Axis Labels */}
        {points.map((p, idx) => (
          <text 
            key={idx} 
            x={p.x} 
            y={height - 8} 
            textAnchor="middle" 
            className="text-[10px] fill-slate-400 font-semibold"
          >
            {p.label}
          </text>
        ))}
      </svg>

      {/* HTML Floating Tooltip */}
      {hoveredIndex !== null && points[hoveredIndex] && (
        <div 
          className="absolute z-30 p-2.5 bg-slate-900/90 text-white rounded-xl shadow-xl border border-slate-700/50 backdrop-blur-sm pointer-events-none text-xs flex flex-col gap-0.5"
          style={{
            left: `${(points[hoveredIndex].x / width) * 100}%`,
            top: `${(points[hoveredIndex].y / height) * 100}%`,
            transform: 'translate(-50%, -125%)',
            transition: 'left 0.1s ease-out, top 0.1s ease-out',
          }}
        >
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
            {points[hoveredIndex].label}
          </span>
          <span className="font-extrabold text-teal-300 text-sm">
            Rp {new Intl.NumberFormat('id-ID').format(points[hoveredIndex].value)}
          </span>
          <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-slate-900/90 border-r border-b border-slate-700/50 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

export default AreaChart;
