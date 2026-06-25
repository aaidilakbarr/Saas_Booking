import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Calendar, Users, MapPin, CreditCard, Upload, Loader2, Star, ShieldAlert, AlertTriangle, ArrowLeft, MessageSquareText } from 'lucide-react';

const BookingDetailPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  // States
  const [booking, setBooking] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  
  // Cancel States
  const [cancelling, setCancelling] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    fetchBookingDetail();
  }, [code]);

  const fetchBookingDetail = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/bookings/${code}`);
      setBooking(response.data.booking);
      setBankAccounts(response.data.bank_accounts || []);
    } catch (err) {
      console.error('Error fetching detail:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm('Apakah Anda yakin ingin membatalkan pemesanan ini?')) return;
    setCancelling(true);
    try {
      await api.delete(`/bookings/${code}`);
      fetchBookingDetail();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membatalkan pemesanan.');
    } finally {
      setCancelling(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError('');
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Pilih berkas bukti pembayaran terlebih dahulu.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const formData = new FormData();
      formData.append('proof_image', file);

      await api.post(`/bookings/${code}/payment`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setFile(null);
      fetchBookingDetail();
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah bukti.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await api.post(`/bookings/${code}/review`, {
        rating,
        title: reviewTitle,
        comment: reviewComment
      });

      setReviewSuccess('Ulasan Anda berhasil dikirim!');
      // Reload booking to reflect review presence
      fetchBookingDetail();
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Gagal mengirimkan ulasan.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase tracking-wide">Menunggu Pembayaran</span>;
      case 'payment_uploaded':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-wide">Verifikasi Pembayaran</span>;
      case 'confirmed':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 uppercase tracking-wide">Dikonfirmasi</span>;
      case 'checked_in':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border-purple-200 uppercase tracking-wide">Checked In</span>;
      case 'checked_out':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-655 border-slate-200 uppercase tracking-wide">Checked Out</span>;
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-ptpn-700 rounded-full animate-spin"></div>
          <Loader2 size={24} className="animate-spin text-ptpn-700 absolute" />
        </div>
        <p className="text-slate-655 text-sm font-bold animate-pulse">Memuat detail reservasi...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl text-slate-650 bg-white/95 border border-emerald-800/10 font-bold font-sans">
        <p>Pemesanan tidak ditemukan.</p>
      </div>
    );
  }

  const isCancellable = ['pending_payment', 'payment_uploaded', 'confirmed'].includes(booking.status);

  return (
    <div className="py-6 space-y-6 max-w-4xl mx-auto px-4 md:px-0">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/account/bookings')}
          className="text-xs text-slate-550 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
        >
          <ArrowLeft size={14} /> Kembali ke Riwayat
        </button>

        {isCancellable && (
          <button
            onClick={handleCancelBooking}
            disabled={cancelling}
            className="px-3.5 py-2 rounded-xl border border-red-200 text-red-700 bg-red-55 hover:bg-red-100 text-xs font-bold disabled:opacity-50 transition cursor-pointer"
          >
            {cancelling ? 'Membatalkan...' : 'Batalkan Pemesanan'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Left Column: Booking Details */}
        <div className="md:col-span-2 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-emerald-800/10 font-sans">
              <span className="font-mono text-sm font-bold text-slate-500 tracking-wider">
                {booking.booking_code}
              </span>
              {getStatusBadge(booking.status)}
            </div>

            <div className="space-y-1 font-sans">
              <h2 className="text-xl font-bold text-slate-800 leading-tight">
                {booking.room_type?.property?.name}
              </h2>
              <p className="text-xs text-slate-500 font-medium flex items-center gap-1">
                <MapPin size={12} className="text-ptpn-700" /> {booking.room_type?.property?.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-emerald-800/10 shadow-sm text-xs font-sans">
              <div>
                <span className="text-slate-550 block font-semibold">Check-In</span>
                <span className="text-sm font-bold text-slate-800">{booking.check_in}</span>
              </div>
              <div>
                <span className="text-slate-555 block font-semibold">Check-Out</span>
                <span className="text-sm font-bold text-slate-800">{booking.check_out}</span>
              </div>
              <div className="pt-2 border-t border-emerald-800/10">
                <span className="text-slate-550 block font-semibold">Nama Tamu</span>
                <span className="text-sm font-bold text-slate-800">{booking.guest_name}</span>
              </div>
              <div className="pt-2 border-t border-emerald-800/10">
                <span className="text-slate-550 block font-semibold">Kontak</span>
                <span className="text-sm font-bold text-slate-800">{booking.guest_phone}</span>
              </div>
            </div>

            {booking.special_request && (
              <div className="p-3.5 bg-white border border-emerald-800/15 rounded-xl text-xs shadow-sm font-sans">
                <span className="font-bold text-slate-700 block mb-1">Catatan Khusus:</span>
                <p className="text-slate-600 leading-relaxed font-medium">{booking.special_request}</p>
              </div>
            )}
          </div>

          {/* Review form block (checked_out) */}
          {booking.status === 'checked_out' && (
            <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md space-y-4">
              <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquareText size={20} className="text-ptpn-700" /> Berikan Ulasan Penginapan
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Ulasan Anda sangat berarti bagi kami untuk meningkatkan kualitas pelayanan akomodasi PTPN IV.
              </p>

              {booking.review ? (
                // If review already submitted
                <div className="p-4 bg-slate-50 rounded-xl border border-emerald-800/10 space-y-2 shadow-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-800">{booking.review.title || 'Ulasan Anda'}</span>
                    <span className="flex items-center gap-0.5 text-yellow-700 text-xs font-bold bg-ptpn-700/10 border border-ptpn-700/20 px-2.5 py-1 rounded-full">
                      <Star size={12} fill="currentColor" className="text-yellow-500" /> {booking.review.rating}.0
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{booking.review.comment}</p>
                </div>
              ) : (
                // Submit review form
                <form onSubmit={handleSubmitReview} className="space-y-4 pt-2">
                  {reviewSuccess && (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      {reviewSuccess}
                    </div>
                  )}
                  {reviewError && (
                    <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs font-semibold">
                      {reviewError}
                    </div>
                  )}

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-650">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setRating(val)}
                          className="text-yellow-400 hover:scale-110 transition cursor-pointer"
                        >
                          <Star size={20} fill={val <= rating ? 'currentColor' : 'none'} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Judul Ringkas</label>
                    <input
                      type="text"
                      required
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      placeholder="e.g. Tempat yang nyaman dan asri!"
                      className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-sm focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">Komentar / Ulasan</label>
                    <textarea
                      rows="3"
                      required
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Tuliskan pengalaman menginap Anda..."
                      className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-sm focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="bg-ptpn-700 hover:bg-ptpn-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
                  >
                    {submittingReview ? 'Mengirim...' : 'Kirim Ulasan'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Pricing & Payment Info */}
        <div className="space-y-4">
          {/* Billing Card */}
          <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md space-y-4 text-xs font-sans">
            <h3 className="font-bold text-slate-800 text-sm border-b border-emerald-800/10 pb-2">Rincian Pembayaran</h3>
            
            <div className="flex justify-between">
              <span className="text-slate-550 font-medium">Tipe Kamar:</span>
              <span className="text-slate-800 font-bold text-right">{booking.room_type?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550 font-medium">Harga per malam:</span>
              <span className="text-slate-800 font-bold">
                Rp {new Intl.NumberFormat('id-ID').format(booking.price_per_night)}
              </span>
            </div>
            <div className="flex justify-between pb-2 border-b border-slate-200/60">
              <span className="text-slate-555 font-medium">Durasi Menginap:</span>
              <span className="text-slate-800 font-bold">{booking.nights} Malam</span>
            </div>

            <div className="flex justify-between text-sm font-bold pt-1">
              <span className="text-slate-800">Total Bayar:</span>
              <span className="text-ptpn-700">
                Rp {new Intl.NumberFormat('id-ID').format(booking.total_price)}
              </span>
            </div>
          </div>

          {/* Re-upload receipt section if rejected or upload proof if pending */}
          {['pending_payment', 'rejected'].includes(booking.status) && (
            <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md space-y-4 text-xs font-sans">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Upload size={16} className="text-ptpn-700" /> 
                {booking.status === 'rejected' ? 'Upload Ulang Bukti Bayar' : 'Upload Bukti Bayar'}
              </h3>

              {booking.status === 'rejected' && booking.payment?.rejection_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-750 leading-normal flex gap-1.5 font-medium shadow-sm">
                  <ShieldAlert size={16} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Alasan Penolakan Finance:</span>
                    <span>"{booking.payment.rejection_reason}"</span>
                  </div>
                </div>
              )}

              {/* Bank Accounts details */}
              <div className="space-y-2 border-b border-slate-200/60 pb-3">
                <span className="text-slate-550 block font-semibold">Transfer Ke:</span>
                {bankAccounts.map((bank) => (
                  <div key={bank.id} className="p-3 bg-slate-50 rounded-xl border border-emerald-800/10 shadow-sm space-y-0.5">
                    <span className="font-bold text-slate-700 block">{bank.bank_name}</span>
                    <span className="font-mono font-extrabold text-ptpn-700 block text-sm">{bank.account_number}</span>
                  </div>
                ))}
              </div>

              {/* Upload Form */}
              {uploadError && (
                <div className="p-3 rounded-xl bg-red-55 border border-red-200 text-red-755 text-xs font-semibold">
                  {uploadError}
                </div>
              )}

              <form onSubmit={handleUploadProof} className="space-y-3">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={handleFileChange}
                  className="w-full text-slate-600 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border file:border-slate-250 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-750 hover:file:bg-slate-200 cursor-pointer"
                />
                <button
                  type="submit"
                  disabled={uploading}
                  className="w-full bg-ptpn-700 hover:bg-ptpn-800 text-white font-bold py-2.5 rounded-xl text-[10px] uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
                >
                  {uploading ? 'Mengunggah...' : 'Kirim Bukti'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingDetailPage;
