import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { Calendar, Users, FileText, ArrowRight, Loader2 } from 'lucide-react';

const BookingPage = () => {
  const { slug, roomTypeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const getQueryParam = (key) => new URLSearchParams(location.search).get(key) || '';
  const checkIn = getQueryParam('check_in');
  const checkOut = getQueryParam('check_out');

  // States
  const [property, setProperty] = useState(null);
  const [roomType, setRoomType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form input states (default prefilled from user details)
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestCount, setGuestCount] = useState('1');
  const [specialRequest, setSpecialRequest] = useState('');

  useEffect(() => {
    // Basic redirect if dates are missing
    if (!checkIn || !checkOut) {
      navigate(`/property/${slug}`);
      return;
    }

    const fetchBookingDetails = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/properties/${slug}?check_in=${checkIn}&check_out=${checkOut}`);
        setProperty(response.data);
        const room = response.data.room_types?.find(r => r.id === parseInt(roomTypeId));
        setRoomType(room);
      } catch (err) {
        console.error('Error loading booking info:', err);
        setError('Gagal memuat detail pemesanan.');
      } finally {
        setLoading(false);
      }
    };
    fetchBookingDetails();
  }, [slug, roomTypeId, checkIn, checkOut, navigate]);

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const response = await api.post('/bookings', {
        room_type_id: parseInt(roomTypeId),
        guest_name: guestName,
        guest_phone: guestPhone,
        guest_count: parseInt(guestCount),
        check_in: checkIn,
        check_out: checkOut,
        special_request: specialRequest,
      });
      
      const { booking } = response.data;
      navigate(`/booking/confirmation/${booking.booking_code}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Terjadi kesalahan saat membuat pesanan.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-slate-100 border-t-teal-600 rounded-full animate-spin"></div>
          <Loader2 size={18} className="animate-spin text-teal-655 absolute" />
        </div>
        <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider animate-pulse">Menyiapkan form reservasi Anda...</p>
      </div>
    );
  }

  if (error && !property) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl max-w-lg mx-auto border border-red-200 bg-white shadow-lg">
        <p className="text-red-500 font-semibold text-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative py-8 max-w-5xl mx-auto space-y-6 overflow-hidden px-4 md:px-6">
      {/* Background visual elements */}
      <div className="glow-sphere w-96 h-96 bg-teal-100/10 -top-10 left-10"></div>
      <div className="glow-sphere w-96 h-96 bg-sky-100/10 bottom-10 right-10"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-1 relative z-10"
      >
        <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Form Reservasi Kamar</h1>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Silakan lengkapi detail kunjungan Anda untuk mengunci slot reservasi.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Left Form */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-2 space-y-4"
        >
          <div className="glass-panel p-6 md:p-8 rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.02)] space-y-6">
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
              <Users size={14} className="text-teal-600" /> Informasi Data Pengunjung
            </h2>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-150 text-red-500 text-xs font-semibold">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitBooking} className="space-y-5 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nama Lengkap Tamu Utama</label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all shadow-sm"
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Nomor Telepon Kontak</label>
                  <input
                    type="tel"
                    required
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all shadow-sm"
                    placeholder="e.g. 08123456789"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Jumlah Tamu Menginap</label>
                  <div className="relative">
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(e.target.value)}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all shadow-sm font-semibold cursor-pointer"
                    >
                      {[...Array(roomType?.capacity || 2)].map((_, i) => (
                        <option key={i + 1} value={i + 1} className="bg-white text-slate-800">
                          {i + 1} Orang Tamu
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2">Catatan Khusus (Opsional)</label>
                <textarea
                  rows="3"
                  value={specialRequest}
                  onChange={(e) => setSpecialRequest(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 text-xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500 focus:outline-none transition-all shadow-sm"
                  placeholder="e.g. Permintaan ranjang besar, kamar bebas asap rokok, check-in terlambat, dll."
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 size={13} className="animate-spin" /> Mengunci Slot Kamar Anda...
                  </>
                ) : (
                  <>
                    Kunci Slot & Lanjutkan Pembayaran <ArrowRight size={13} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>

        {/* Right Summary Card */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="glass-panel p-6 rounded-2xl border border-slate-100 bg-white shadow-[0_4px_24px_rgba(15,23,42,0.02)] space-y-4 text-xs relative overflow-hidden">
            <div className="glow-sphere w-32 h-32 bg-teal-100/10 -bottom-5 -right-5"></div>
            <h3 className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2.5 relative z-10">Rincian Reservasi</h3>
            
            <div className="space-y-1 relative z-10">
              <p className="font-extrabold text-xs text-slate-900">{property?.name}</p>
              <p className="text-[10px] text-teal-600 font-bold uppercase tracking-wider">{roomType?.name}</p>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs relative z-10">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={12} className="text-teal-600" /> Check-In</span>
                <span className="text-slate-800 font-bold">{checkIn}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 flex items-center gap-1.5"><Calendar size={12} className="text-teal-600" /> Check-Out</span>
                <span className="text-slate-800 font-bold">{checkOut}</span>
              </div>
            </div>

            {roomType && (
              <div className="border-t border-slate-100 pt-3 space-y-3 relative z-10 font-sans">
                <h4 className="font-bold text-slate-400 uppercase tracking-wider text-[9px]">Kalkulasi Biaya</h4>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
                  {roomType.price_breakdown?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-slate-500 text-[10px] font-medium">
                      <span>{item.date} ({item.is_weekend ? 'Weekend' : 'Weekday'})</span>
                      <span className="font-semibold text-slate-800">Rp {new Intl.NumberFormat('id-ID').format(item.price)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between pt-3 border-t border-slate-100 text-xs font-bold items-center">
                  <span className="text-slate-800 uppercase tracking-wider font-extrabold">Total Pembayaran</span>
                  <span className="text-sm font-black text-teal-700">
                    Rp {new Intl.NumberFormat('id-ID').format(roomType.total_stay_price || 0)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default BookingPage;

