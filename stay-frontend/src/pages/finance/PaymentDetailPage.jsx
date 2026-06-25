import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ArrowLeft, Check, X, ShieldAlert, Loader2, ShieldCheck, Download } from 'lucide-react';

const PaymentDetailPage = () => {
  const { id } = useParams(); // Payment ID
  const navigate = useNavigate();

  // States
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Rejection dialog
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchPaymentDetail();
  }, [id]);

  const fetchPaymentDetail = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/finance/payments/${id}`);
      setPayment(response.data);
    } catch (err) {
      console.error('Error fetching payment detail:', err);
      setError('Gagal memuat rincian bukti pembayaran.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!window.confirm('Apakah Anda yakin bukti transfer ini valid dan ingin mengonfirmasi pembayaran?')) return;

    setSubmitting(true);
    setError('');
    try {
      await api.put(`/finance/payments/${id}/confirm`);
      navigate('/finance/payments');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengonfirmasi pembayaran.');
      setSubmitting(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectionReason.trim()) {
      alert('Harap berikan alasan penolakan.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await api.put(`/finance/payments/${id}/reject`, {
        rejection_reason: rejectionReason
      });
      navigate('/finance/payments');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menolak pembayaran.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-ptpn-700 rounded-full animate-spin"></div>
          <Loader2 size={24} className="animate-spin text-ptpn-700 absolute" />
        </div>
        <p className="text-slate-600 text-sm font-medium animate-pulse">Memuat bukti pembayaran...</p>
      </div>
    );
  }

  if (error && !payment) {
    return (
      <div className="glass-panel p-12 text-center rounded-2xl border border-emerald-800/10 bg-white/95">
        <p className="text-red-650 font-semibold text-sm">{error}</p>
      </div>
    );
  }

  const { booking } = payment;
  const isPending = payment.status === 'pending';

  return (
    <div className="py-6 max-w-4xl mx-auto space-y-6 px-4 md:px-0">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/finance/payments')}
          className="text-xs text-slate-550 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
        >
          <ArrowLeft size={14} /> Kembali ke Antrian
        </button>

        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
          payment.status === 'confirmed'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
            : payment.status === 'rejected'
            ? 'bg-red-50 text-red-700 border-red-200'
            : 'bg-blue-50 text-blue-700 border-blue-200'
        }`}>
          Status: {payment.status}
        </span>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Main Container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Side: Proof Receipt Image Preview */}
        <div className="space-y-4">
          <div className="glass-panel p-5 rounded-2xl flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3 self-start">
              Bukti Transfer
            </h3>
            
            <div className="w-full aspect-[3/4] bg-slate-100 rounded-xl overflow-hidden border border-emerald-800/10 flex items-center justify-center relative group">
              {payment.proof_path ? (
                // PDF fallback or render as image
                payment.proof_path.toLowerCase().endsWith('.pdf') ? (
                  <div className="text-center p-6 space-y-4">
                    <ShieldAlert size={48} className="text-ptpn-700 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">Bukti diunggah dalam format PDF.</p>
                    <a
                      href={`http://127.0.0.1:8000/storage/${payment.proof_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-ptpn-700 hover:bg-ptpn-800 text-white font-bold text-xs transition cursor-pointer shadow-sm"
                    >
                      <Download size={14} /> Unduh PDF
                    </a>
                  </div>
                ) : (
                  <>
                    <img
                      src={`http://127.0.0.1:8000/storage/${payment.proof_path}`}
                      alt="Bukti Transfer"
                      className="w-full h-full object-contain cursor-zoom-in group-hover:scale-105 transition-transform duration-300"
                    />
                    {/* View external link shortcut */}
                    <a
                      href={`http://127.0.0.1:8000/storage/${payment.proof_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] border border-emerald-800/10 text-slate-650 font-bold shadow-sm cursor-pointer"
                    >
                      Buka Tab Baru
                    </a>
                  </>
                )
              ) : (
                <span className="text-slate-400 font-semibold text-xs">Bukti pembayaran rusak</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Verification Details and Action Form */}
        <div className="space-y-4">
          <div className="glass-panel p-6 rounded-2xl space-y-4 text-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide border-b border-emerald-800/10 pb-2">
              Rincian Reservasi
            </h2>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <div>
                <span className="text-slate-500 block">Kode Booking:</span>
                <span className="text-sm font-mono font-bold text-slate-800">{booking.booking_code}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Nama Tamu:</span>
                <span className="text-sm font-semibold text-slate-800">{booking.guest_name}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-emerald-800/10">
                <span className="text-slate-500 block">Nama Akomodasi & Kamar:</span>
                <span className="text-xs font-semibold text-slate-700">{booking.room_type?.property?.name}</span>
                <span className="text-[10px] text-slate-500 block">{booking.room_type?.name}</span>
              </div>
              <div className="col-span-2 pt-2 border-t border-emerald-800/10">
                <span className="text-slate-500 block">Tanggal Menginap:</span>
                <span className="text-xs font-semibold text-slate-700">
                  {booking.check_in} s/d {booking.check_out} ({booking.nights} malam)
                </span>
              </div>
              <div className="col-span-2 pt-2 border-t border-emerald-800/10 flex justify-between items-center text-sm">
                <span className="text-slate-550 font-semibold">Total Yang Harus Dibayar:</span>
                <span className="font-extrabold text-ptpn-700 text-base">
                  Rp {new Intl.NumberFormat('id-ID').format(booking.total_price)}
                </span>
              </div>
            </div>
          </div>

          {/* Verification Actions (Visible only if status pending) */}
          {isPending && !showRejectForm && (
            <div className="flex gap-4 font-sans">
              <button
                onClick={handleConfirm}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-1.5 bg-ptpn-700 hover:bg-ptpn-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-md hover:shadow-lg"
              >
                <Check size={16} /> Konfirmasi Valid
              </button>
              <button
                onClick={() => setShowRejectForm(true)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold py-3 rounded-xl text-xs uppercase tracking-wider border border-red-200 transition disabled:opacity-50 cursor-pointer"
              >
                <X size={16} /> Tolak Transfer
              </button>
            </div>
          )}

          {/* Rejection Form Box */}
          {showRejectForm && (
            <div className="glass-panel p-5 rounded-2xl border border-red-200 bg-red-50/50 space-y-4">
              <h3 className="text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert size={16} /> Alasan Penolakan Pembayaran
              </h3>
              
              <form onSubmit={handleReject} className="space-y-4">
                <textarea
                  rows="3"
                  required
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Sebutkan alasan penolakan secara jelas (e.g. Nominal tidak sesuai, struk tidak terbaca/palsu)..."
                  className="w-full p-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
                ></textarea>
                
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-red-650 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition cursor-pointer shadow-sm"
                  >
                    Kirim Penolakan
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRejectForm(false)}
                    className="px-4 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold rounded-xl text-xs border border-slate-200 transition cursor-pointer"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Info if already validated */}
          {!isPending && (
            <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 flex items-center gap-3 text-xs text-slate-650 shadow-sm">
              <ShieldCheck size={20} className="text-ptpn-700 shrink-0" />
              <div>
                <p className="font-bold text-slate-850">Pembayaran telah diproses.</p>
                <p>
                  Tindakan verifikasi dilakukan oleh <strong>{payment.verifier?.name || 'Tim Finance'}</strong> pada{' '}
                  {payment.confirmed_at ? new Date(payment.confirmed_at).toLocaleString('id-ID') : '-'}.
                </p>
                {payment.rejection_reason && (
                  <p className="text-red-700 font-bold mt-1">Alasan Penolakan: "{payment.rejection_reason}"</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailPage;
