import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { LayoutDashboard, Hotel, ShieldAlert, BadgeCent, TrendingUp, CalendarDays, Loader2, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        const response = await api.get('/manager/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Error fetching manager stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending_payment':
        return <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-yellow-50 text-yellow-700 border-yellow-200">Unpaid</span>;
      case 'payment_uploaded':
        return <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-200">Wait Pay</span>;
      case 'confirmed':
        return <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-200">Confirmed</span>;
      case 'checked_in':
        return <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-purple-50 text-purple-700 border-purple-200">In</span>;
      case 'checked_out':
        return <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-650 border-slate-200">Out</span>;
      default:
        return <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full border bg-slate-100 text-slate-600 border-slate-200">{status}</span>;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-ptpn-700 rounded-full animate-spin"></div>
          <Loader2 size={24} className="animate-spin text-ptpn-700 absolute" />
        </div>
        <p className="text-slate-600 text-sm font-medium animate-pulse">Memuat dashboard statistik...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const popularRooms = data?.popular_rooms || [];
  const recentBookings = data?.recent_bookings || [];
  const revenueMonthly = data?.revenue_monthly || [];

  return (
    <div className="py-6 space-y-6 px-4 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="text-ptpn-700" /> Dashboard Pengelola Properti
        </h1>
        <p className="text-sm text-slate-500">Ringkasan operasional dan keuangan penginapan PTPN IV.</p>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* Metric 1: Total Properties */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Total Properti</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.total_properties || 0}</span>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl"><Hotel size={20} /></div>
        </div>

        {/* Metric 2: Bookings */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Pesanan Bulan Ini</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.bookings_this_month || 0}</span>
            <span className="text-[10px] text-slate-500 font-medium block">All-time: {stats.bookings_all_time || 0}</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl"><CalendarDays size={20} /></div>
        </div>

        {/* Metric 3: Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Total Pendapatan</span>
            <span className="text-lg font-extrabold text-ptpn-700">
              Rp {new Intl.NumberFormat('id-ID').format(stats.revenue_all_time || 0)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">Transaksi Dikonfirmasi</span>
          </div>
          <div className="p-3 bg-emerald-50 text-ptpn-700 border border-emerald-200 rounded-xl"><BadgeCent size={20} /></div>
        </div>

        {/* Metric 4: Today's Occupancy */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Okupansi Kamar Hari Ini</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {stats.rooms_occupied_today || 0} <span className="text-xs text-slate-500">/ {stats.rooms_total_stock || 0} Kamar</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">Tersedia: {stats.rooms_available_today || 0} kamar</span>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl"><TrendingUp size={20} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Revenue Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-850 flex items-center gap-1.5">
            <TrendingUp size={18} className="text-ptpn-700" /> Tren Pendapatan Bulanan
          </h2>
          
          {revenueMonthly.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
              Data transaksi terkonfirmasi belum tersedia untuk grafis.
            </div>
          ) : (
            <div className="space-y-4 font-sans">
              {/* Premium Bar Chart in CSS */}
              <div className="flex items-end justify-between h-48 pt-4 px-2">
                {revenueMonthly.map((m, idx) => {
                  const maxVal = Math.max(...revenueMonthly.map(item => item.total)) || 1;
                  const pct = Math.max(10, (m.total / maxVal) * 100);
                  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                      <div className="text-[10px] text-slate-650 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                        Rp {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(m.total)}
                      </div>
                      <div
                        style={{ height: `${pct}%` }}
                        className="w-8 rounded-t bg-gradient-to-t from-ptpn-700 to-emerald-700 group-hover:from-emerald-700 group-hover:to-teal-500 transition-all duration-500 shadow-sm"
                      ></div>
                      <span className="text-[10px] text-slate-500 font-medium">{monthNames[m.month - 1]} '{String(m.year).substring(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right: Popular Rooms list */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm space-y-4">
          <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">Terlaris Dipesan</h2>
          <p className="text-[10px] text-slate-500 -mt-2">Tipe kamar paling sering diminati pengunjung.</p>

          {popularRooms.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center font-medium">Belum ada pesanan terdaftar.</p>
          ) : (
            <div className="space-y-3 font-sans">
              {popularRooms.map((pop, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-emerald-800/10">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block truncate max-w-[150px]">
                      {pop.room_type?.name}
                    </span>
                    <span className="text-[10px] text-slate-500 block truncate max-w-[150px]">
                      {pop.room_type?.property?.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold bg-ptpn-700/10 text-ptpn-700 border border-ptpn-700/20 px-2 py-0.5 rounded-lg shrink-0">
                    {pop.count}x dipesan
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Bookings List */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-800/10 pb-3 font-sans">
          <h2 className="text-base font-bold text-slate-850">Reservasi Terbaru</h2>
          <button
            onClick={() => navigate('/manager/bookings')}
            className="text-xs font-bold text-ptpn-700 hover:text-ptpn-800 flex items-center gap-1 cursor-pointer transition"
          >
            Lihat semua <ArrowRight size={14} />
          </button>
        </div>

        {recentBookings.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center font-medium">Belum ada reservasi masuk.</p>
        ) : (
          <div className="overflow-x-auto font-sans">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-600 border-b border-emerald-800/15">
                  <th className="pb-3 font-bold">Kode</th>
                  <th className="pb-3 font-bold">Tamu</th>
                  <th className="pb-3 font-bold">Properti & Kamar</th>
                  <th className="pb-3 font-bold">Tanggal</th>
                  <th className="pb-3 font-bold">Total Harga</th>
                  <th className="pb-3 font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-800/10">
                {recentBookings.map((b) => (
                  <tr key={b.id} className="text-slate-600 font-medium">
                    <td className="py-3.5 font-mono font-semibold text-slate-500">{b.booking_code}</td>
                    <td className="py-3.5">{b.guest_name}</td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 block">{b.room_type?.property?.name}</span>
                      <span className="text-[10px] text-slate-500 block">{b.room_type?.name}</span>
                    </td>
                    <td className="py-3.5 text-slate-500">
                      {b.check_in} s/d {b.check_out}
                    </td>
                    <td className="py-3.5 font-extrabold text-ptpn-700 text-sm">
                      Rp {new Intl.NumberFormat('id-ID').format(b.total_price)}
                    </td>
                    <td className="py-3.5">{getStatusBadge(b.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
