import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { useAuthStore } from '../../stores/authStore';
import { Clock, CheckCircle2, AlertTriangle, CreditCard, Upload, Loader2, ArrowRight } from 'lucide-react';

const BookingConfirmationPage = () => {
  const { code } = useParams();
  const navigate = useNavigate();

  // States
  const [booking, setBooking] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const fetchConfirmationData = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/bookings/${code}`);
        setBooking(response.data.booking);
        setBankAccounts(response.data.bank_accounts || []);
      } catch (err) {
        console.error('Error fetching confirmation detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchConfirmationData();
  }, [code]);

  // Countdown timer logic
  useEffect(() => {
    if (!booking || booking.status !== 'pending_payment' || !booking.expires_at) return;

    const timer = setInterval(() => {
      const expiresAt = new Date(booking.expires_at).getTime();
      const now = new Date().getTime();
      const distance = expiresAt - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft('00:00');
        setIsExpired(true);
        // Refresh booking state
        setBooking(prev => prev ? { ...prev, status: 'expired' } : null);
      } else {
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        const mStr = minutes < 10 ? '0' + minutes : minutes;
        const sStr = seconds < 10 ? '0' + seconds : seconds;
        
        setTimeLeft(`${mStr}:${sStr}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [booking]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError('');
  };

  const handleUploadProof = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Harap pilih berkas bukti transfer terlebih dahulu.');
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

      // Navigate to customer booking list on success
      navigate('/account/bookings', { state: { uploadSuccess: true } });
    } catch (err) {
      setUploadError(err.response?.data?.message || 'Gagal mengunggah bukti pembayaran.');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-[#3f6239] rounded-full animate-spin"></div>
          <Loader2 size={24} className="animate-spin text-[#3f6239] absolute" />
        </div>
        <p className="text-slate-600 text-sm font-medium animate-pulse">Menyiapkan rincian pembayaran...</p>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl max-w-lg mx-auto border border-emerald-800/10 bg-white/95 shadow-md">
        <p className="text-slate-600 font-medium">Pemesanan dengan kode tersebut tidak ditemukan.</p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-3xl mx-auto space-y-6 px-4 md:px-6">
      {/* Header Info */}
      <div className="text-center space-y-2">
        <div className="inline-flex justify-center text-[#3f6239]">
          <CheckCircle2 size={48} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Reservasi Berhasil Dibuat!</h1>
        <p className="text-sm text-slate-500">
          Kode Pemesanan Anda: <strong className="text-[#3f6239] font-mono tracking-wider">{booking.booking_code}</strong>
        </p>
      </div>

      {/* Expiry Timer banner (only if pending) */}
      {booking.status === 'pending_payment' && (
        <div className="glass-panel p-4 rounded-xl border border-yellow-350/40 bg-yellow-50/90 flex items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-2.5 text-yellow-900">
            <Clock size={20} className="text-yellow-700 shrink-0" />
            <div className="text-left text-xs">
              <p className="font-bold">Selesaikan pembayaran sebelum waktu habis!</p>
              <p className="text-slate-600 font-medium">Kamar Anda terkunci sementara agar terhindar dari pemesan lain.</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className="font-mono text-2xl font-extrabold text-yellow-700">{timeLeft}</span>
          </div>
        </div>
      )}

      {booking.status === 'expired' && (
        <div className="glass-panel p-4 rounded-xl border border-red-200 bg-red-50 flex items-center gap-2.5 text-red-800 shadow-sm">
          <AlertTriangle size={20} className="text-red-600 shrink-0" />
          <div className="text-left text-xs">
            <p className="font-bold">Waktu Pembayaran Habis (Expired)</p>
            <p className="text-slate-600">Slot kamar Anda telah dilepas. Silakan lakukan pemesanan ulang.</p>
          </div>
        </div>
      )}

      {/* Main Grid: Payment Transfer Instructions + Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left column: Bank transfer instructions */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CreditCard size={18} className="text-[#3f6239]" /> Rekening Transfer
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Kirimkan uang tepat sebesar total harga ke salah satu rekening PTPN IV berikut:
          </p>

          <div className="space-y-3">
            {bankAccounts.map((bank) => (
              <div key={bank.id} className="p-3 bg-[#f4f7f4] rounded-xl border border-emerald-800/5 space-y-1">
                <span className="text-xs font-bold text-slate-700 block">{bank.bank_name}</span>
                <span className="text-sm font-mono font-bold text-[#3f6239] block tracking-wider">
                  {bank.account_number}
                </span>
                <span className="text-[10px] text-slate-500 block font-medium">A/N: {bank.account_name}</span>
              </div>
            ))}
          </div>

          <div className="pt-2.5 border-t border-emerald-800/10 flex justify-between items-center text-sm font-sans">
            <span className="text-slate-500 font-semibold">Nominal Transfer:</span>
            <span className="text-base font-extrabold text-[#3f6239]">
              Rp {new Intl.NumberFormat('id-ID').format(booking.total_price)}
            </span>
          </div>
        </div>

        {/* Right column: Receipt uploader */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md space-y-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <Upload size={18} className="text-[#3f6239]" /> Unggah Bukti Bayar
          </h2>
          
          {uploadError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-650 text-xs font-medium">
              {uploadError}
            </div>
          )}

          {booking.status === 'pending_payment' ? (
            <form onSubmit={handleUploadProof} className="space-y-4">
              <div className="border-2 border-dashed border-emerald-800/20 hover:border-emerald-800/40 bg-[#f4f7f4]/40 hover:bg-[#f4f7f4]/80 rounded-xl p-6 text-center cursor-pointer transition relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  required
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2 text-slate-500">
                  <Upload className="mx-auto text-[#3f6239]/70" size={24} />
                  <p className="text-xs font-bold text-slate-700">
                    {file ? file.name : 'Pilih berkas bukti transfer'}
                  </p>
                  <p className="text-[10px] text-slate-400">Mendukung JPG, PNG, PDF (Maks. 2MB)</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading || isExpired}
                className="w-full bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition-all cursor-pointer shadow-md shadow-emerald-800/10 hover:shadow-lg disabled:opacity-50"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 size={16} className="animate-spin" /> Mengunggah...
                  </span>
                ) : (
                  'Kirim Bukti Pembayaran'
                )}
              </button>
            </form>
          ) : (
            <div className="text-center py-6 space-y-3 font-sans">
              <span className="inline-block px-3 py-1.5 text-xs font-bold rounded-full bg-[#eef3ee] text-[#3f6239] capitalize border border-emerald-800/10">
                Status: {booking.status.replace('_', ' ')}
              </span>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Bukti pembayaran telah diunggah atau pesanan sudah tidak aktif. Anda dapat memantau status pesanan di halaman Riwayat Booking.
              </p>
              <button
                onClick={() => navigate('/account/bookings')}
                className="inline-flex items-center gap-1.5 text-xs text-[#3f6239] hover:text-[#304d2c] font-bold mt-2"
              >
                Ke Riwayat Booking <ArrowRight size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
