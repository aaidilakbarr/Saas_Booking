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
      <div className="glow-sphere w-96 h-96 bg-emerald-300/10 top-0 left-1/4 -translate-x-1/2"></div>
      <div className="glow-sphere w-96 h-96 bg-emerald-400/10 top-1/3 right-10"></div>

      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative rounded-[2.5rem] overflow-hidden min-h-[460px] flex flex-col justify-center px-6 py-16 md:px-16 border border-white/40 shadow-xl"
        style={{
          backgroundImage: `linear-gradient(rgba(20, 36, 22, 0.45), rgba(20, 36, 22, 0.35)), url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=1470&auto=format&fit=cover')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="space-y-6 max-w-2xl relative z-10 text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-900/60 border border-emerald-500/20 text-emerald-350 text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">
            <TreePine size={12} className="text-emerald-400 animate-pulse" /> Wisata Agro & Penginapan PTPN IV
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-sans text-white drop-shadow-md">
            Find Eco-Friendly <br/>
            Homes Easily
          </h1>
          <p className="text-emerald-100 text-sm md:text-base leading-relaxed max-w-lg drop-shadow">
            Temukan kenikmatan menginap terbaik di lingkungan asri perkebunan kelapa sawit dan teh PTPN IV Sumatera Utara.
          </p>
          <button 
            onClick={() => navigate('/search')}
            className="px-5 py-2.5 rounded-full border border-white/60 hover:bg-white hover:text-emerald-950 text-white text-xs font-bold uppercase tracking-wider transition-all duration-350 cursor-pointer"
          >
            Suggest Event
          </button>
        </div>
      </motion.div>

      {/* Search Capsule Panel (Reference Aligned) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="relative -mt-28 z-20 max-w-5xl mx-auto p-3.5 rounded-[2.5rem] bg-[#d0dfcc] border border-emerald-500/10 shadow-lg"
      >
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-2xl md:rounded-full shadow-sm p-2 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-2 px-4">
            {/* Destination */}
            <div className="relative py-2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800">Tujuan / Hotel</span>
              <div className="flex items-center gap-2 mt-1">
                <MapPin size={14} className="text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Cari hotel, kota, dll..."
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-xs focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* Dates range check-in */}
            <div className="relative py-2 flex flex-col justify-center border-b md:border-b-0 md:border-r border-slate-200">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800">Check-In</span>
              <div className="flex items-center gap-2 mt-1">
                <Calendar size={14} className="text-emerald-600 shrink-0" />
                <input
                  type="date"
                  value={checkIn}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full bg-transparent text-slate-800 text-xs focus:outline-none font-semibold cursor-pointer"
                />
              </div>
            </div>

            {/* Guests selection */}
            <div className="relative py-2 flex flex-col justify-center">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-800">Tamu</span>
              <div className="flex items-center gap-2 mt-1">
                <Users size={14} className="text-emerald-600 shrink-0" />
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
            className="w-full md:w-auto bg-emerald-700 hover:bg-emerald-800 text-white px-8 py-3 rounded-xl md:rounded-full flex items-center justify-center font-bold text-xs uppercase tracking-wider transition shadow cursor-pointer shrink-0"
          >
            Compare / Cari
          </button>
        </form>
      </motion.div>

      {/* Welcome / Intro Section (Reference Aligned) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-5xl mx-auto px-4">
        {/* Left Side: Framed Image with badges */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-5 relative"
        >
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-white">
            <img 
              src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=600&auto=format&fit=cover" 
              alt="Welcome home resort" 
              className="w-full h-full object-cover"
            />
          </div>
          {/* Top-Left Badge */}
          <span className="absolute -top-4 -left-4 flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-700 text-white text-[10px] font-bold shadow-lg">
            <Award size={12} /> Best Host
          </span>
          {/* Bottom-Right Badge */}
          <span className="absolute -bottom-4 -right-4 flex items-center justify-center w-12 h-12 rounded-full bg-orange-100 border-2 border-white shadow-lg text-orange-600 font-bold text-xl animate-float">
            🍃
          </span>
        </motion.div>

        {/* Right Side: Description */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-7 space-y-6"
        >
          <h2 className="text-3xl font-extrabold text-slate-800 leading-tight">
            Welcome on STAY
          </h2>
          <p className="text-slate-655 text-sm leading-relaxed">
            Menyediakan penginapan dan villa premium dengan pemandangan alam perkebunan yang menakjubkan. Nikmati fasilitas lengkap, udara segar, dan petualangan agro yang mengesankan bersama keluarga Anda.
          </p>
          <div className="pt-2 flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/search')}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition shadow cursor-pointer"
            >
              📍 Cari Penginapan
            </button>
            <button 
              onClick={() => navigate('/search')}
              className="px-5 py-3 rounded-full hover:bg-slate-100 text-slate-700 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              See all
            </button>
          </div>
        </motion.div>
      </div>

      {/* Featured Properties Grid (Reference Aligned) */}
      <div className="space-y-8 max-w-5xl mx-auto px-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-800 font-sans">
            10 Whalalagy Ear Tains?
          </h2>
          <p className="text-xs text-slate-500">Rekomendasi akomodasi terbaik di lingkungan perkebunan PTPN IV.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-panel rounded-3xl h-96 overflow-hidden shimmer border border-white/5"></div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-3xl">
            <p className="text-slate-500 text-sm">Belum ada properti aktif yang terdaftar saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featured.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="bg-white rounded-3xl overflow-hidden flex flex-col border border-slate-100 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer"
                onClick={() => navigate(`/property/${property.slug}`)}
              >
                {/* Image aspect ratio container */}
                <div className="aspect-[4/3] bg-slate-105 overflow-hidden relative">
                  {property.thumbnail ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${property.thumbnail}`}
                      alt={property.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-100">
                      No Image
                    </div>
                  )}
                  <span className="absolute top-4 left-4 text-[9px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#e2ede0] text-emerald-800 border border-emerald-200">
                    {property.type}
                  </span>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-800 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {property.name}
                    </h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin size={12} className="text-emerald-600 shrink-0" /> {property.city}, {property.province}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-1 text-yellow-500 text-xs font-bold bg-slate-50 px-2 py-1 rounded-full border border-slate-100">
                      <Star size={12} fill="currentColor" /> {property.avg_rating || 'N/A'} 
                      <span className="text-slate-400 text-[10px] font-normal">({property.reviews_count || 0})</span>
                    </div>
                    {property.lowest_price && (
                      <div className="text-right">
                        <span className="text-[9px] text-slate-450 block uppercase tracking-wider">Mulai</span>
                        <span className="text-sm font-black text-emerald-700">
                          Rp {new Intl.NumberFormat('id-ID').format(property.lowest_price)}
                        </span>
                        <span className="text-[9px] text-slate-455"> / malam</span>
                      </div>
                    )}
                  </div>

                  <button 
                    className="w-full py-2.5 rounded-full bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/property/${property.slug}`);
                    }}
                  >
                    Learn More
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LandingPage;
