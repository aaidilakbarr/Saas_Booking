import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ShieldCheck, Calendar, Eye, Loader2, ArrowRight } from 'lucide-react';

const PaymentQueuePage = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQueue();
  }, []);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const response = await api.get('/finance/payments');
      setBookings(response.data);
    } catch (err) {
      console.error('Error fetching payments queue:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-6 space-y-6 px-4 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <ShieldCheck className="text-ptpn-700" /> Antrian Verifikasi Pembayaran
        </h1>
        <p className="text-sm text-slate-500">Daftar reservasi masuk yang telah mengunggah bukti transfer.</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-ptpn-700 rounded-full animate-spin"></div>
            <Loader2 size={24} className="animate-spin text-ptpn-700 absolute" />
          </div>
          <p className="text-slate-600 text-sm font-medium animate-pulse">Memuat antrian verifikasi...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-slate-600 bg-white/95 border border-emerald-800/10 font-bold">
          Tidak ada antrian bukti pembayaran yang perlu diverifikasi saat ini. Pekerjaan selesai!
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-600 border-b border-emerald-800/10 font-sans">
                  <th className="pb-3 font-bold">Kode Booking</th>
                  <th className="pb-3 font-bold">Tamu</th>
                  <th className="pb-3 font-bold">Akomodasi & Kamar</th>
                  <th className="pb-3 font-bold">Waktu Unggah</th>
                  <th className="pb-3 font-bold">Total Biaya</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-800/10 font-sans">
                {bookings.map((b) => (
                  <tr key={b.id} className="text-slate-600 font-medium">
                    <td className="py-4 font-mono font-semibold text-slate-500">{b.booking_code}</td>
                    <td className="py-4">
                      <span className="font-bold text-slate-800 block">{b.guest_name}</span>
                      <span className="text-[10px] text-slate-500 block">{b.guest_phone}</span>
                    </td>
                    <td className="py-4">
                      <span className="font-bold text-slate-800 block">{b.room_type?.property?.name}</span>
                      <span className="text-[10px] text-slate-500 block">{b.room_type?.name}</span>
                    </td>
                    <td className="py-4 text-slate-500">
                      {b.payment?.uploaded_at ? new Date(b.payment.uploaded_at).toLocaleString('id-ID') : '-'}
                    </td>
                    <td className="py-4 font-extrabold text-ptpn-700 text-sm">
                      Rp {new Intl.NumberFormat('id-ID').format(b.total_price)}
                    </td>
                    <td className="py-4 text-right">
                      <button
                        onClick={() => navigate(`/finance/payments/${b.payment?.id}`)}
                        className="inline-flex items-center gap-1.5 bg-ptpn-700 hover:bg-ptpn-800 text-white font-bold px-3.5 py-2 rounded-xl text-[10px] transition-all uppercase tracking-wider cursor-pointer shadow-sm hover:shadow"
                      >
                        <Eye size={12} /> Tinjau Bukti
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentQueuePage;
