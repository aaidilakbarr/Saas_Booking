import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { Search, MapPin, Calendar, Users, Star, ArrowRight, ShieldCheck, TreePine, Trees, Award } from 'lucide-react';

const LandingPage = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search state
  const [query, setQuery] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('1');

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await api.get('/properties?limit=3');
        setFeatured(response.data.slice(0, 3));
      } catch (err) {
        console.error('Error fetching featured properties:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (checkIn) params.append('check_in', checkIn);
    if (checkOut) params.append('check_out', checkOut);
    if (guests) params.append('guests', guests);
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="relative space-y-24 pb-24 overflow-hidden">
      {/* Background soft glow sources */}
      <div className="glow-sphere w-96 h-96 bg-teal-200/5 top-0 left-1/4 -translate-x-1/2"></div>
      <div className="glow-sphere w-96 h-96 bg-sky-200/5 top-1/3 right-10"></div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative rounded-3xl overflow-hidden min-h-[440px] flex flex-col justify-center px-6 py-16 md:px-16 border border-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)]"
        style={{
          backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.4), rgba(15, 23, 42, 0.2)), url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1470&auto=format&fit=cover')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="space-y-6 max-w-2xl relative z-10 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-white/10 text-white text-[9px] font-bold uppercase tracking-widest backdrop-blur-md">
            <TreePine size={12} className="text-teal-400" /> Wisata Agro & Penginapan PTPN IV
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-sans text-white">
            Temukan Penginapan <br/>
            Asri &amp; Nyaman
          </h1>
          <p className="text-slate-200 text-xs md:text-sm leading-relaxed max-w-lg">
            Temukan kenikmatan menginap terbaik di lingkungan asri perkebunan kelapa sawit dan teh PTPN IV Sumatera Utara.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="px-5 py-2.5 rounded-full border border-white/30 hover:bg-white hover:text-slate-950 text-white text-[11px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
          >
            Jelajahi Sekarang
          </button>
        </div>
      </motion.div>

      {/* Search Capsule Panel */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="relative -mt-20 z-20 max-w-5xl mx-auto p-2 rounded-2xl md:rounded-full bg-white border border-slate-100 shadow-[0_12px_40px_rgba(15,23,42,0.06)]"
      >
        <form onSubmit={handleSearchSubmit} className="bg-transparent flex flex-col md:flex-row items-center gap-2 p-1">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-2 px-4">
            {/* Destination */}
            <div className="relative py-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tujuan / Hotel</span>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={13} className="text-teal-600 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari hotel, kota, dll..."
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-xs focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Dates check-in */}
            <div className="relative py-1 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-100">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Check-In</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={13} className="text-teal-600 shrink-0" />
                <input
                  type={checkIn ? "date" : "text"}
                  placeholder="Masukkan Tanggal"
                  onFocus={(e) => (e.target.type = "date")}
                  onBlur={(e) => {
                    if (!e.target.value) e.target.type = "text";
                  }}
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-slate-800 text-xs focus:outline-none font-semibold cursor-pointer"
                />
              </div>
            </div>

            {/* Guests selection */}
            <div className="relative py-1 flex flex-col justify-center">
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Tamu</span>
              <div className="flex items-center gap-2 mt-1">
                <Users size={13} className="text-teal-600 shrink-0" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full bg-transparent text-slate-800 text-xs focus:outline-none font-semibold cursor-pointer appearance-none"
                >
                  <option value="1">1 Tamu</option>
                  <option value="2">2 Tamu</option>
                  <option value="4">4 Tamu</option>
                  <option value="6">6+ Tamu</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full md:w-auto bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-xl md:rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer shrink-0"
          >
            Cari Penginapan
          </button>
        </form>
      </motion.div>

      {/* Welcome / Intro Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto px-4">
        {/* Left Side: Framed Image with badges */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 relative"
        >
          <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-slate-100 bg-white">
            <img 
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600&auto=format&fit=cover" 
              alt="Welcome resort" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Top-Left Badge */}
          <span className="absolute -top-3 -left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[9px] font-bold uppercase tracking-wider shadow-md">
            <Award size={10} className="text-amber-400" /> Best Host
          </span>
          {/* Bottom-Right Badge */}
          <span className="absolute -bottom-3 -right-3 flex items-center justify-center w-10 h-10 rounded-full bg-teal-50 border border-teal-100 shadow-md text-base animate-float">
            🍃
          </span>
        </motion.div>

        {/* Right Side: Description */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
            Selamat Datang di STAY
          </h2>
          <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
            Menyediakan penginapan dan villa premium dengan pemandangan alam perkebunan yang menakjubkan. Nikmati fasilitas lengkap, udara segar, dan petualangan agro yang mengesankan bersama keluarga Anda.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button 
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-sm cursor-pointer"
            >
              📍 Cari Penginapan
            </button>
            <button 
              onClick={() => navigate('/search')}
              className="px-5 py-2.5 rounded-full border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Lihat Semua
            </button>
          </div>
        </motion.div>
      </div>

      {/* Featured Properties Grid */}
      <div className="space-y-8 max-w-5xl mx-auto px-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 font-sans">
            Rekomendasi Destinasi Terpopuler
          </h2>
          <p className="text-xs text-slate-400">Pilihan akomodasi terbaik di lingkungan perkebunan PTPN IV.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel rounded-2xl h-80 overflow-hidden shimmer border border-slate-100"></div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl border border-slate-100">
            <p className="text-slate-400 text-xs font-semibold">Belum ada properti aktif yang terdaftar saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((property, idx) => (
              <div
                key={property.id}
                className="bg-white rounded-2xl overflow-hidden flex flex-col border border-slate-100 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.03)] hover:shadow-[0_12px_32px_-4px_rgba(15,23,42,0.06)] hover:-translate-y-1 transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/property/${property.slug}`)}
              >
                {/* Image container */}
                <div className="aspect-[4/3] bg-slate-100 overflow-hidden relative">
                  {property.thumbnail ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${property.thumbnail}`}
                      alt={property.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-150 text-xs">
                      No Image
                    </div>
                  )}
                  <span className="absolute top-3 left-3 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/90 text-slate-700 border border-slate-100 backdrop-blur-sm">
                    {property.type}
                  </span>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-extrabold text-slate-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1">
                      <MapPin size={11} className="text-teal-600 shrink-0" /> {property.city}, {property.province}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3.5 border-t border-slate-50">
                    <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold bg-amber-50/50 px-2 py-0.5 rounded-full border border-amber-100/30">
                      <Star size={10} fill="currentColor" /> {property.avg_rating || 'N/A'} 
                      <span className="text-slate-400 text-[9px] font-normal">({property.reviews_count || 0})</span>
                    </div>
                    {property.lowest_price && (
                      <div className="text-right">
                        <span className="text-[8px] text-slate-400 block uppercase tracking-wider">Mulai</span>
                        <span className="text-xs font-extrabold text-teal-700">
                          Rp {new Intl.NumberFormat('id-ID').format(property.lowest_price)}
                        </span>
                        <span className="text-[9px] text-slate-450">/malam</span>
                      </div>
                    )}
                  </div>

                  <button 
                    className="w-full py-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] uppercase tracking-wider transition cursor-pointer shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/property/${property.slug}`);
                    }}
                  >
                    Detail Selengkapnya
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;

