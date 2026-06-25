import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { MapPin, Star, Calendar, Users, Square, Info, ShieldAlert, Loader2, Sparkles } from 'lucide-react';

const PropertyDetailPage = () => {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();

  const queryParams = new URLSearchParams(location.search);
  const checkInQuery = queryParams.get('check_in') || '';
  const checkOutQuery = queryParams.get('check_out') || '';

  // States
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkIn, setCheckIn] = useState(checkInQuery);
  const [checkOut, setCheckOut] = useState(checkOutQuery);
  const [datesError, setDatesError] = useState('');
  const [activeImage, setActiveImage] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Sync state if URL query parameters change
  useEffect(() => {
    setCheckIn(checkInQuery);
    setCheckOut(checkOutQuery);
  }, [checkInQuery, checkOutQuery]);

  useEffect(() => {
    const fetchPropertyDetail = async () => {
      setLoading(true);
      try {
        let url = `/properties/${slug}`;
        if (checkInQuery && checkOutQuery) {
          url += `?check_in=${checkInQuery}&check_out=${checkOutQuery}`;
        }
        const response = await api.get(url);
        setProperty(response.data);
        if (response.data.thumbnail) {
          setActiveImage(response.data.thumbnail);
        } else if (response.data.images?.length > 0) {
          setActiveImage(response.data.images[0].image_path);
        }
      } catch (err) {
        console.error('Error fetching property detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyDetail();
  }, [slug, checkInQuery, checkOutQuery]);

  useEffect(() => {
    const fetchReviews = async () => {
      setReviewsLoading(true);
      try {
        const response = await api.get(`/properties/${slug}/reviews`);
        setReviews(response.data.data || []);
      } catch (err) {
        console.error('Error fetching property reviews:', err);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, [slug]);

  const handleApplyDates = (e) => {
    e.preventDefault();
    setDatesError('');

    if (!checkIn || !checkOut) {
      setDatesError('Pilih tanggal check-in & check-out terlebih dahulu.');
      return;
    }

    if (new Date(checkIn) >= new Date(checkOut)) {
      setDatesError('Tanggal check-out harus setelah tanggal check-in.');
      return;
    }

    const params = new URLSearchParams(location.search);
    params.set('check_in', checkIn);
    params.set('check_out', checkOut);
    navigate(`/property/${slug}?${params.toString()}`);
  };

  const handleBooking = (roomTypeId, availableStock) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/property/${slug}` } } });
      return;
    }

    if (!checkInQuery || !checkOutQuery) {
      setDatesError('Harap tentukan tanggal check-in & check-out terlebih dahulu sebelum memesan.');
      document.getElementById('dates-form')?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    if (availableStock < 1) {
      return; // Room is full
    }

    navigate(`/booking/${slug}/${roomTypeId}?check_in=${checkInQuery}&check_out=${checkOutQuery}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin"></div>
          <Loader2 size={18} className="animate-spin text-teal-650 absolute" />
        </div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Memuat rincian properti Stay...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl max-w-lg mx-auto mt-12 border border-red-100 relative overflow-hidden bg-white shadow-lg">
        <div className="glow-sphere w-64 h-64 bg-red-50/10 top-0 left-0"></div>
        <ShieldAlert size={40} className="text-red-500 mx-auto mb-4 relative z-10 animate-pulse" />
        <p className="text-slate-900 font-extrabold text-base mb-2 relative z-10">Properti Tidak Ditemukan</p>
        <p className="text-slate-500 text-xs mb-6 relative z-10">Properti mungkin telah dinonaktifkan atau tautan tidak valid.</p>
        <Link to="/" className="inline-flex items-center justify-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm relative z-10 cursor-pointer">
          Kembali ke Beranda
        </Link>
      </div>
    );
  }

  return (
    <div className="relative py-8 space-y-8 max-w-6xl mx-auto overflow-hidden px-4 md:px-6">
      {/* Background glow effects */}
      <div className="glow-sphere w-96 h-96 bg-teal-100/10 -top-10 -left-10"></div>
      <div className="glow-sphere w-96 h-96 bg-sky-100/10 bottom-20 right-10"></div>

      {/* Property Head */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-4 relative z-10"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
            {property.type}
          </span>
          <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold bg-amber-50/50 px-3 py-1 rounded-full border border-amber-250/20">
            <Star size={12} fill="currentColor" className="text-amber-500 fill-amber-500" /> {property.avg_rating || '0.0'}
            <span className="text-slate-500 font-normal">({property.reviews_count} ulasan)</span>
          </div>
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight font-sans">
            {property.name}
          </h1>
          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-2 font-medium">
            <MapPin size={13} className="text-teal-600 shrink-0" /> {property.address}, {property.city}, {property.province}
          </p>
        </div>
      </motion.div>

      {/* Gallery Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative z-10"
      >
        {/* Main large image */}
        <div className="lg:col-span-2 aspect-[16/10] bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 shadow-[0_4px_20px_rgba(15,23,42,0.02)] relative">
          {activeImage ? (
            <img
              src={`http://127.0.0.1:8000/storage/${activeImage}`}
              alt={property.name}
              className="w-full h-full object-cover transition-all duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-105 text-xs">
              No Image
            </div>
          )}
        </div>

        {/* Small gallery list */}
        <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto lg:max-h-[380px] pb-2 lg:pb-0 scrollbar-thin">
          {property.thumbnail && (
            <button
              onClick={() => setActiveImage(property.thumbnail)}
              className={`aspect-[4/3] w-28 lg:w-full bg-slate-55 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer shadow-sm ${
                activeImage === property.thumbnail ? 'border-teal-600' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <img
                src={`http://127.0.0.1:8000/storage/${property.thumbnail}`}
                alt="Thumbnail"
                className="w-full h-full object-cover"
              />
            </button>
          )}

          {property.images && property.images.map((img) => (
            <button
              key={img.id}
              onClick={() => setActiveImage(img.image_path)}
              className={`aspect-[4/3] w-28 lg:w-full bg-slate-55 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer shadow-sm ${
                activeImage === img.image_path ? 'border-teal-600' : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <img
                src={`http://127.0.0.1:8000/storage/${img.image_path}`}
                alt="Gallery"
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </motion.div>

      {/* Description & Check Availability Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Info & Description */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-panel p-6 rounded-2xl space-y-4"
          >
            <h2 className="text-lg font-bold text-slate-800">Deskripsi</h2>
            <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">
              {property.description || 'Belum ada deskripsi untuk properti ini.'}
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="glass-panel p-6 rounded-2xl space-y-4"
          >
            <h2 className="text-lg font-bold text-slate-800">Fasilitas Properti</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities && property.amenities.length > 0 ? (
                property.amenities.map((amenity, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-650 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    <Sparkles size={14} className="text-teal-650" />
                    <span className="capitalize font-semibold">{amenity.replace('_', ' ')}</span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 col-span-3">Fasilitas umum belum terdaftar.</p>
              )}
            </div>
          </motion.div>
        </div>

        {/* Check Dates Sidebar */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          id="dates-form" 
          className="glass-panel p-6 rounded-2xl border border-slate-100 space-y-4 relative overflow-hidden bg-white shadow-[0_4px_24px_rgba(15,23,42,0.03)]"
        >
          <div className="glow-sphere w-48 h-48 bg-teal-100/10 -bottom-10 -right-10"></div>
          <h2 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase tracking-wider relative z-10">
            <Calendar size={16} className="text-teal-600" /> Tentukan Tanggal
          </h2>
          
          {datesError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-150 text-red-500 text-xs relative z-10 font-medium">
              {datesError}
            </div>
          )}

          <form onSubmit={handleApplyDates} className="space-y-4 relative z-10">
            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Check-In</label>
              <input
                type={checkIn ? "date" : "text"}
                placeholder="Masukkan Tanggal"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                required
                value={checkIn}
                min={new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckIn(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all shadow-sm cursor-pointer"
              />
            </div>

            <div>
              <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Check-Out</label>
              <input
                type={checkOut ? "date" : "text"}
                placeholder="Masukkan Tanggal"
                onFocus={(e) => (e.target.type = "date")}
                onBlur={(e) => {
                  if (!e.target.value) e.target.type = "text";
                }}
                required
                value={checkOut}
                min={checkIn || new Date().toISOString().split('T')[0]}
                onChange={(e) => setCheckOut(e.target.value)}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all shadow-sm cursor-pointer"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer shadow-sm"
            >
              Cek Ketersediaan
            </button>
          </form>

          {checkInQuery && checkOutQuery && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-500 text-[10px] flex gap-2 relative z-10 shadow-sm leading-relaxed">
              <Info size={14} className="text-teal-600 shrink-0 mt-0.5" />
              <span>
                Menampilkan harga dan kamar untuk check-in <strong>{checkInQuery}</strong> hingga check-out <strong>{checkOutQuery}</strong>.
              </span>
            </div>
          )}
        </motion.div>
      </div>

      {/* Room Types Listing */}
      <div className="space-y-6 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-850">Tipe Kamar yang Tersedia</h2>
          <p className="text-sm text-slate-500">Pilih tipe kamar yang sesuai dengan preferensi kenyamanan Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {property.room_types && property.room_types.map((room, idx) => {
            const isFull = checkInQuery && checkOutQuery && (room.available_stock < 1);
            return (
              <motion.div 
                key={room.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden flex flex-col border border-slate-100 hover:shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition-all duration-300"
              >
                {/* Room Image */}
                <div className="aspect-[16/9] bg-slate-50 relative overflow-hidden group">
                  {room.images && room.images.length > 0 ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${room.images[0].image_path}`}
                      alt={room.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-105 text-slate-400 font-bold text-xs">
                      No Image
                    </div>
                  )}
                  
                  {checkInQuery && checkOutQuery && (
                    <span className={`absolute top-3 left-3 text-[8px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border shadow-sm ${
                       isFull 
                        ? 'bg-red-50 text-red-700 border-red-150' 
                        : 'bg-teal-50 text-teal-700 border-teal-200'
                    }`}>
                      {isFull ? 'Penuh' : `Tersedia: ${room.available_stock} Kamar`}
                    </span>
                  )}
                </div>

                {/* Body Room Details */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4 bg-transparent">
                  <div className="space-y-2">
                    <h3 className="text-base font-extrabold text-slate-900">{room.name}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{room.description}</p>
                    
                    {/* Room Meta Specs */}
                    <div className="flex gap-4 text-[11px] text-slate-500 pt-2 font-medium">
                      <span className="flex items-center gap-1.5"><Users size={13} className="text-teal-600" /> Maks {room.capacity} Tamu</span>
                      {room.size_sqm && <span className="flex items-center gap-1.5"><Square size={13} className="text-teal-600" /> {room.size_sqm} m²</span>}
                    </div>

                    {/* Room Amenities */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {room.amenities && room.amenities.map((amenity, idx) => (
                        <span key={idx} className="text-[9px] px-2.5 py-1 bg-slate-50 text-slate-550 font-bold rounded-full border border-slate-100 capitalize tracking-wide">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Pricing and Booking Button */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4 mt-4 font-sans">
                    <div>
                      {checkInQuery && checkOutQuery ? (
                        <>
                          <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Total Price</span>
                          <span className="text-base font-black text-teal-700">
                            Rp {new Intl.NumberFormat('id-ID').format(room.total_stay_price || room.price_weekday)}
                          </span>
                          <span className="text-[8px] text-slate-400 block font-semibold uppercase tracking-wider mt-0.5">
                            Avg: Rp {new Intl.NumberFormat('id-ID').format(room.avg_stay_price || room.price_weekday)}/malam
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-[8px] text-slate-400 block uppercase tracking-wider font-semibold">Weekday / Weekend</span>
                          <span className="text-xs font-bold text-slate-900">
                            Rp {new Intl.NumberFormat('id-ID').format(room.price_weekday)}
                          </span>
                          <span className="text-xs text-slate-400 font-medium"> / Rp {new Intl.NumberFormat('id-ID').format(room.price_weekend)}</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() => handleBooking(room.id, room.available_stock)}
                      disabled={isFull}
                      className={`px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                        isFull
                          ? 'bg-slate-100 text-slate-450 cursor-not-allowed border border-slate-200'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow-sm'
                      }`}
                    >
                      {isFull ? 'Kamar Penuh' : 'Pesan Sekarang'}
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Customer Reviews Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="glass-panel p-6 rounded-2xl space-y-6 relative z-10 bg-white"
      >
        <div>
          <h2 className="text-lg font-bold text-slate-800">Ulasan Pengunjung</h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Tanggapan jujur dari mereka yang telah menginap.</p>
        </div>

        {reviewsLoading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="animate-spin text-teal-600" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs font-medium">
            Belum ada ulasan untuk penginapan ini.
          </div>
        ) : (
          <div className="space-y-4 divide-y divide-slate-100">
            {reviews.map((rev) => (
              <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {rev.user?.avatar ? (
                      <img
                        src={`http://127.0.0.1:8000/storage/${rev.user.avatar}`}
                        alt={rev.user.name}
                        className="w-8 h-8 rounded-full object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-xs text-slate-500 font-bold border border-slate-100">
                        {rev.user?.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-900">{rev.user?.name}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{new Date(rev.created_at).toLocaleDateString('id-ID')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold bg-amber-50/50 px-2 py-0.5 rounded-full border border-amber-100/30">
                    <Star size={10} fill="currentColor" /> {rev.rating}.0
                  </div>
                </div>

                <div className="pl-10 space-y-1">
                  {rev.title && <p className="text-xs font-bold text-slate-800">{rev.title}</p>}
                  <p className="text-xs text-slate-500 leading-relaxed">{rev.comment}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PropertyDetailPage;
