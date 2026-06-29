import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { LayoutDashboard, BadgeCent, TrendingUp, ShieldAlert, BookOpen, Loader2, ArrowRight } from 'lucide-react';
import AreaChart from '../../components/common/AreaChart';
import BarChart from '../../components/common/BarChart';

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
          <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-ptpn-700 rounded-full animate-spin"></div>
          <Loader2 size={24} className="animate-spin text-ptpn-700 absolute" />
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
          <LayoutDashboard className="text-ptpn-700" /> Dashboard Keuangan
        </h1>
        <p className="text-sm text-slate-500">Verifikasi bukti transfer pembayaran dan pantau laporan transaksi masuk.</p>
      </div>

      {/* Stats Counter Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-550 font-semibold block">Total Revenue</span>
            <span className="text-lg font-extrabold text-ptpn-700">
              Rp {new Intl.NumberFormat('id-ID').format(stats.revenue_total || 0)}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block">Bulan ini: Rp {new Intl.NumberFormat('id-ID').format(stats.revenue_this_month || 0)}</span>
          </div>
          <div className="p-3 bg-emerald-50 text-ptpn-700 rounded-xl border border-emerald-800/10"><BadgeCent size={20} /></div>
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
          <div className="p-3 bg-emerald-50 text-ptpn-700 rounded-xl border border-emerald-800/10"><BookOpen size={20} /></div>
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
            <TrendingUp size={18} className="text-ptpn-700" /> Grafik Revenue Bulanan (6 Bulan Terakhir)
          </h2>

          {monthlyRevenue.length === 0 ? (
            <div className="h-48 flex items-center justify-center text-slate-400 text-xs font-semibold">
              Belum ada transaksi pendapatan masuk.
            </div>
          ) : (
            <AreaChart
              data={monthlyRevenue.map(m => {
                const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                return {
                  label: `${monthNames[m.month - 1]} '${String(m.year).substring(2)}`,
                  value: Number(m.total)
                };
              })}
              heightClass="h-56"
            />
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
            className="w-full bg-ptpn-700 hover:bg-ptpn-800 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-800/10 hover:shadow-lg cursor-pointer"
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
          <BarChart
            data={dailyTransactions.map(day => ({
              label: day.date.substring(5),
              value: Number(day.count),
              secondaryValue: Number(day.volume)
            }))}
            heightClass="h-56"
          />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
