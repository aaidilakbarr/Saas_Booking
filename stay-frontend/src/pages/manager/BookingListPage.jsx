import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { CalendarDays, Search, Check, LogOut, Loader2, ArrowRight } from 'lucide-react';

const BookingListPage = () => {
  // States
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingCode, setUpdatingCode] = useState(null);

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const response = await api.get('/manager/bookings');
      setBookings(response.data);
    } catch (err) {
      console.error('Error loading manager bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (code) => {
    if (!window.confirm(`Konfirmasi check-in tamu untuk kode pesanan ${code}?`)) return;
    
    setUpdatingCode(code);
    try {
      await api.put(`/manager/bookings/${code}/check-in`);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses check-in.');
    } finally {
      setUpdatingCode(null);
    }
  };

  const handleCheckOut = async (code) => {
    if (!window.confirm(`Konfirmasi check-out tamu untuk kode pesanan ${code}?`)) return;

    setUpdatingCode(code);
    try {
      await api.put(`/manager/bookings/${code}/check-out`);
      fetchReservations();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memproses check-out.');
    } finally {
      setUpdatingCode(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 uppercase tracking-wide">Belum Bayar</span>;
      case 'payment_uploaded':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border-blue-200 uppercase tracking-wide">Butuh Verifikasi</span>;
      case 'confirmed':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border-emerald-200 uppercase tracking-wide">Dikonfirmasi</span>;
      case 'checked_in':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 border-purple-200 uppercase tracking-wide">Checked In</span>;
      case 'checked_out':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-650 border-slate-200 uppercase tracking-wide">Checked Out</span>;
      case 'cancelled':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 border-red-200 uppercase tracking-wide">Batal</span>;
      case 'expired':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border-red-200 uppercase tracking-wide">Kadaluarsa</span>;
      case 'rejected':
        return <span className="inline-block text-[9px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border-rose-200 uppercase tracking-wide">Ditolak</span>;
      default:
        return null;
    }
  };

  // Filter bookings locally
  const filteredBookings = bookings.filter((b) => {
    const matchStatus = statusFilter === '' || b.status === statusFilter;
    const matchSearch = searchQuery === '' || 
      b.booking_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guest_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.room_type?.property?.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  return (
    <div className="py-6 space-y-6 px-4 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <CalendarDays className="text-ptpn-700" /> Daftar Reservasi Tamu
        </h1>
        <p className="text-sm text-slate-500">Kelola kehadiran tamu (Check-In / Check-Out) pada penginapan Anda.</p>
      </div>

      {/* Filters bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row gap-3 border border-emerald-800/10 bg-white/95 shadow-sm font-sans">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-3 text-slate-450" />
          <input
            type="text"
            placeholder="Cari kode booking, nama tamu, properti..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm cursor-pointer"
          >
            <option value="">Semua Status</option>
            <option value="pending_payment">Belum Bayar</option>
            <option value="payment_uploaded">Butuh Verifikasi</option>
            <option value="confirmed">Dikonfirmasi</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Batal</option>
            <option value="expired">Kadaluarsa</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 font-sans">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-ptpn-700 rounded-full animate-spin"></div>
            <Loader2 size={24} className="animate-spin text-ptpn-700 absolute" />
          </div>
          <p className="text-slate-655 text-sm font-bold animate-pulse">Memuat daftar reservasi...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-slate-650 bg-white/95 border border-emerald-800/10 font-bold font-sans">
          Tidak ada reservasi ditemukan.
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md overflow-hidden">
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-600 border-b border-emerald-800/15">
                  <th className="pb-3 font-bold">Kode Booking</th>
                  <th className="pb-3 font-bold">Detail Tamu</th>
                  <th className="pb-3 font-bold">Kamar & Properti</th>
                  <th className="pb-3 font-bold">Check-In / Out</th>
                  <th className="pb-3 font-bold">Biaya</th>
                  <th className="pb-3 font-bold">Status</th>
                  <th className="pb-3 font-bold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-800/10">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="text-slate-600 font-medium">
                    <td className="py-3.5 font-mono font-semibold text-slate-500">{b.booking_code}</td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 block">{b.guest_name}</span>
                      <span className="text-[10px] text-slate-500 block">{b.guest_phone}</span>
                      <span className="text-[9px] text-slate-500 block">{b.guest_count} Tamu</span>
                    </td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 block">{b.room_type?.property?.name}</span>
                      <span className="text-[10px] text-slate-500 block">{b.room_type?.name}</span>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      <span className="block font-semibold">{b.check_in}</span>
                      <span className="text-slate-500 text-[10px] block">s/d {b.check_out} ({b.nights} malam)</span>
                    </td>
                    <td className="py-3.5 font-extrabold text-ptpn-700 text-sm">
                      Rp {new Intl.NumberFormat('id-ID').format(b.total_price)}
                    </td>
                    <td className="py-3.5">{getStatusBadge(b.status)}</td>
                    <td className="py-3.5 text-right">
                      {b.status === 'confirmed' && (
                        <button
                          onClick={() => handleCheckIn(b.booking_code)}
                          disabled={updatingCode === b.booking_code}
                          className="inline-flex items-center gap-1.5 bg-ptpn-700 hover:bg-ptpn-800 text-white font-bold px-3.5 py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-sm hover:shadow transition disabled:opacity-50 animate-float-subtle"
                        >
                          <Check size={12} /> Check-In
                        </button>
                      )}

                      {b.status === 'checked_in' && (
                        <button
                          onClick={() => handleCheckOut(b.booking_code)}
                          disabled={updatingCode === b.booking_code}
                          className="inline-flex items-center gap-1.5 bg-purple-600 hover:bg-purple-750 text-white font-bold px-3.5 py-2 rounded-xl text-[10px] uppercase tracking-wider cursor-pointer shadow-sm hover:shadow transition disabled:opacity-50"
                        >
                          <LogOut size={12} /> Check-Out
                        </button>
                      )}

                      {!['confirmed', 'checked_in'].includes(b.status) && (
                        <span className="text-[10px] text-slate-450 font-bold">—</span>
                      )}
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

export default BookingListPage;
