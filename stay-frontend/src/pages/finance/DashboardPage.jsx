import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { LayoutDashboard, BadgeCent, TrendingUp, ShieldAlert, BookOpen, Loader2, ArrowRight } from 'lucide-react';

const DashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFinanceStats = async () => {
      setLoading(true);
      try {
        const response = await api.get('/finance/dashboard');
        setData(response.data);
      } catch (err) {
        console.error('Error loading finance stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFinanceStats();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-[#3f6239] rounded-full animate-spin"></div>
          <Loader2 size={24} className="animate-spin text-[#3f6239] absolute" />
        </div>
        <p className="text-slate-600 text-sm font-medium animate-pulse">Memuat dashboard keuangan...</p>
      </div>
    );
  }

  const stats = data?.stats || {};
  const dailyTransactions = data?.daily_transactions || [];
  const monthlyRevenue = data?.monthly_revenue || [];

  return (
    <div className="py-6 space-y-6 px-4 md:px-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <LayoutDashboard className="text-[#3f6239]" /> Dashboard Keuangan
        </h1>
        <p className="text-sm text-slate-500">Verifikasi bukti transfer pembayaran dan pantau laporan transaksi masuk.</p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Total Revenue</span>
            <span className="text-lg font-extrabold text-[#3f6239]">
              Rp {new Intl.NumberFormat('id-ID').format(stats.revenue_total || 0)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">Bulan ini: Rp {new Intl.NumberFormat('id-ID').format(stats.revenue_this_month || 0)}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-[#3f6239] rounded-xl border border-emerald-800/10"><BadgeCent size={20} /></div>
        </div>

        {/* Pending Queue */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Antrian Pembayaran</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.queue_count || 0}</span>
            <span className="text-[10px] text-slate-500 font-medium block">Butuh Verifikasi</span>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-150/30"><ShieldAlert size={20} /></div>
        </div>

        {/* Confirmed Transactions */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Diterima / Confirmed</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.transactions_confirmed || 0}</span>
            <span className="text-[10px] text-slate-500 font-medium block">Pembayaran Valid</span>
          </div>
          <div className="p-3 bg-emerald-50 text-[#3f6239] rounded-xl border border-emerald-800/10"><BookOpen size={20} /></div>
        </div>

        {/* Rejected / Expired */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Ditolak / Expired</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {stats.transactions_rejected || 0} <span className="text-xs text-slate-500">/ {stats.transactions_expired || 0}</span>
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">Batal / Deadline Habis</span>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-xl border border-red-150/30"><ShieldAlert size={20} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Monthly Revenue trends */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm space-y-6">
          <h2 className="text-base font-bold text-slate-850 flex items-center gap-1.5">
            <TrendingUp size={18} className="text-[#3f6239]" /> Grafik Revenue Bulanan (6 Bulan Terakhir)
          </h2>

          {monthlyRevenue.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
              Belum ada transaksi pendapatan masuk.
            </div>
          ) : (
            <div className="flex items-end justify-between h-48 pt-4 px-2 font-sans">
              {monthlyRevenue.map((m, idx) => {
                const maxVal = Math.max(...monthlyRevenue.map(item => item.total)) || 1;
                const pct = Math.max(10, (m.total / maxVal) * 100);
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 group">
                    <div className="text-[10px] text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                      Rp {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(m.total)}
                    </div>
                    <div
                      style={{ height: `${pct}%` }}
                      className="w-10 rounded-t bg-gradient-to-t from-[#3f6239] to-emerald-700 group-hover:from-emerald-700 group-hover:to-teal-500 transition-all duration-500 shadow-sm"
                    ></div>
                    <span className="text-[10px] text-slate-500 font-medium">{monthNames[m.month - 1]} '{String(m.year).substring(2)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Quick link to queue */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">Pemberitahuan</h2>
            <p className="text-xs text-slate-600 font-medium leading-normal">
              Ada sebanyak <strong className="text-blue-700 font-extrabold text-sm">{stats.queue_count || 0}</strong> pesanan yang telah mengunggah bukti pembayaran dan menunggu tindakan verifikasi dari Anda.
            </p>
          </div>

          <button
            onClick={() => navigate('/finance/payments')}
            className="w-full bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-800/10 hover:shadow-lg cursor-pointer"
          >
            Buka Antrian Verifikasi <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Daily Volume trends (14 days) */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm space-y-4">
        <h2 className="text-base font-bold text-slate-850">Aktivitas Transaksi Harian (14 Hari Terakhir)</h2>
        
        {dailyTransactions.length === 0 ? (
          <p className="text-xs text-slate-400 py-12 text-center font-medium">Belum ada aktivitas transaksi harian.</p>
        ) : (
          <div className="flex items-end justify-between h-40 pt-4 px-2 overflow-x-auto gap-4 scrollbar-thin">
            {dailyTransactions.map((day, idx) => {
              const maxCount = Math.max(...dailyTransactions.map(item => item.count)) || 1;
              const pct = Math.max(15, (day.count / maxCount) * 100);
              return (
                <div key={idx} className="flex flex-col items-center gap-2 shrink-0 group min-w-[36px]">
                  <div className="text-[9px] text-slate-600 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    {day.count} Booking (Rp {new Intl.NumberFormat('id-ID', { notation: 'compact' }).format(day.volume)})
                  </div>
                  <div
                    style={{ height: `${pct}px` }}
                    className="w-4 rounded-t bg-[#3f6239]/60 group-hover:bg-[#3f6239] transition-all duration-300"
                  ></div>
                  <span className="text-[9px] text-slate-500 font-medium">{day.date.substring(5)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
