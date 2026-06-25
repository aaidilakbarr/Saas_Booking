import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Calendar, Compass, Star, Eye, Info, CheckCircle2, Loader2, MessageSquareText } from 'lucide-react';

const BookingListPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    // Show upload success alert if redirected from confirmation page
    if (location.state?.uploadSuccess) {
      setShowNotification(true);
      // Clean up location state
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await api.get('/bookings');
        setBookings(response.data);
      } catch (err) {
        console.error('Error fetching bookings history:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase tracking-wide">Menunggu Pembayaran</span>;
      case 'payment_uploaded':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wide">Verifikasi Pembayaran</span>;
      case 'confirmed':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wide">Dikonfirmasi</span>;
      case 'checked_in':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border-purple-200 uppercase tracking-wide">Checked In</span>;
      case 'checked_out':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-650 border-slate-200 uppercase tracking-wide">Checked Out</span>;
      case 'cancelled':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border-red-200 uppercase tracking-wide">Dibatalkan</span>;
      case 'expired':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border-red-200 uppercase tracking-wide">Kadaluarsa</span>;
      case 'rejected':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border-rose-200 uppercase tracking-wide">Pembayaran Ditolak</span>;
      default:
        return null;
    }
  };

  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto px-4 md:px-0">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Riwayat Reservasi Saya</h1>
        <p className="text-sm text-slate-500">Pantau status pembayaran, check-in, dan berikan ulasan di sini.</p>
      </div>

      {showNotification && (
        <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm flex gap-2.5 items-center font-sans shadow-sm">
          <CheckCircle2 size={20} className="text-ptpn-700 shrink-0" />
          <div>
            <span className="font-bold block">Bukti transfer berhasil diunggah!</span>
            <span className="text-xs text-slate-500 font-medium">Status pesanan Anda telah berubah menjadi "Verifikasi Pembayaran". Tim Finance akan meninjau unggahan Anda secepatnya.</span>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4 font-sans">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-ptpn-700 rounded-full animate-spin"></div>
            <Loader2 size={24} className="animate-spin text-ptpn-700 absolute" />
          </div>
          <p className="text-slate-655 text-sm font-bold animate-pulse">Memuat riwayat reservasi...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-4 bg-white/95 border border-emerald-800/10 text-slate-650 font-bold font-sans">
          <p>Anda belum pernah melakukan reservasi penginapan.</p>
          <button
            onClick={() => navigate('/search')}
            className="inline-flex bg-ptpn-700 hover:bg-ptpn-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            Cari Penginapan Sekarang
          </button>
        </div>
      ) : (
        <div className="space-y-4 font-sans">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
            >
              {/* Hotel & details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 tracking-wider">
                    {booking.booking_code}
                  </span>
                  {getStatusBadge(booking.status)}
                </div>
                <h3 className="text-base font-bold text-slate-800 leading-tight">
                  {booking.room_type?.property?.name}
                </h3>
                <p className="text-xs text-slate-550 font-medium">
                  {booking.room_type?.name} • {booking.nights} Malam • {booking.guest_name}
                </p>
                <div className="flex gap-4 text-[10px] text-slate-550 pt-1 font-semibold">
                  <span>In: {booking.check_in}</span>
                  <span>Out: {booking.check_out}</span>
                </div>
              </div>

              {/* Price & view details button */}
              <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto shrink-0 border-t sm:border-t-0 border-slate-200/60 pt-3 sm:pt-0">
                <div className="text-left sm:text-right mb-2">
                  <span className="text-[10px] text-slate-550 block font-semibold">Total Biaya</span>
                  <span className="text-sm font-extrabold text-ptpn-700">
                    Rp {new Intl.NumberFormat('id-ID').format(booking.total_price)}
                  </span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/account/bookings/${booking.booking_code}`)}
                    className="inline-flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-250 transition cursor-pointer shadow-sm"
                  >
                    <Eye size={14} /> Detail
                  </button>

                  {booking.status === 'checked_out' && !booking.payment?.booking?.review && (
                    <button
                      onClick={() => navigate(`/account/bookings/${booking.booking_code}`)}
                      className="inline-flex items-center gap-1.5 bg-ptpn-700 hover:bg-ptpn-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <MessageSquareText size={14} /> Tulis Ulasan
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingListPage;
