import React, { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { BarChart, FileSpreadsheet, Printer, Search, Loader2 } from 'lucide-react';

const ReportPage = () => {
  // Filter States
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [status, setStatus] = useState('');
  const [propertyId, setPropertyId] = useState('');

  // Data States
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1 });

  useEffect(() => {
    // Load properties list for the dropdown filter
    const fetchDropdownProperties = async () => {
      try {
        const response = await api.get('/properties');
        setProperties(response.data);
      } catch (err) {
        console.error('Error fetching properties list for filter:', err);
      }
    };
    fetchDropdownProperties();
  }, []);

  useEffect(() => {
    fetchReportData(1);
  }, [startDate, endDate, status, propertyId]);

  const fetchReportData = async (page = 1) => {
    setLoading(true);
    try {
      let url = `/finance/reports?page=${page}`;
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;
      if (status) url += `&status=${status}`;
      if (propertyId) url += `&property_id=${propertyId}`;

      const response = await api.get(url);
      setBookings(response.data.data || []);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page
      });
    } catch (err) {
      console.error('Error fetching report listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = () => {
    // Generate query params string
    let urlParams = '';
    if (startDate) urlParams += `&start_date=${startDate}`;
    if (endDate) urlParams += `&end_date=${endDate}`;
    if (status) urlParams += `&status=${status}`;
    if (propertyId) urlParams += `&property_id=${propertyId}`;

    const token = localStorage.getItem('stay_token');
    // Direct link to backend API export endpoint with Sanctum token in query param or trigger download via window.open
    const downloadUrl = `http://127.0.0.1:8000/api/finance/reports/export?token=${token}${urlParams}`;
    window.open(downloadUrl, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  const getStatusLabel = (status) => {
    return status.replace('_', ' ').toUpperCase();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
      case 'checked_out':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'checked_in':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'cancelled':
      case 'expired':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="py-6 space-y-6 px-4 md:px-6">
      {/* Page Title (Hidden during Print) */}
      <div className="print:hidden">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <BarChart className="text-[#3f6239]" /> Laporan Transaksi Keuangan
        </h1>
        <p className="text-sm text-slate-500">Analisis dan unduh riwayat pemesanan akomodasi.</p>
      </div>

      {/* Printable Header (Visible ONLY during Print) */}
      <div className="hidden print:block text-slate-900 border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold">STAY by PTPN IV</h1>
        <h2 className="text-lg font-semibold">Laporan Transaksi Reservasi Penginapan</h2>
        <p className="text-xs text-slate-600 mt-1">
          Periode: {startDate || 'Awal'} s/d {endDate || 'Sekarang'}
        </p>
      </div>

      {/* Filter Sidebar & Form (Hidden during Print) */}
      <div className="print:hidden glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
          <Search size={16} /> Filter Pencarian Laporan
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-sans">
          <div>
            <label className="block text-slate-650 font-bold mb-1">Mulai Tanggal</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-slate-650 font-bold mb-1">Sampai Tanggal</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-slate-650 font-bold mb-1">Pilih Properti</label>
            <select
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="">Semua Properti</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-slate-650 font-bold mb-1">Status Reservasi</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm cursor-pointer"
            >
              <option value="">Semua Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="checked_in">Checked In</option>
              <option value="checked_out">Checked Out</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        <div className="pt-3 border-t border-emerald-800/10 flex justify-end gap-3 font-sans">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2.5 rounded-xl text-xs border border-slate-250 transition cursor-pointer"
          >
            <FileSpreadsheet size={14} className="text-[#3f6239]" /> Ekspor Excel (CSV)
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold px-4 py-2.5 rounded-xl text-xs transition cursor-pointer shadow-md hover:shadow-lg"
          >
            <Printer size={14} /> Cetak Laporan (PDF)
          </button>
        </div>
      </div>

      {/* Report Listings Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-[#3f6239] rounded-full animate-spin"></div>
            <Loader2 size={24} className="animate-spin text-[#3f6239] absolute" />
          </div>
          <p className="text-slate-600 text-sm font-medium animate-pulse">Menghitung laporan transaksi...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-slate-650 bg-white/95 border border-emerald-800/10 font-bold print:text-slate-900">
          Tidak ada data transaksi yang cocok dengan kriteria laporan Anda.
        </div>
      ) : (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md print:border-none print:shadow-none print:p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-600 border-b border-emerald-800/15 print:text-slate-800 print:border-slate-900 font-sans">
                  <th className="pb-3 font-bold">Kode</th>
                  <th className="pb-3 font-bold">Tanggal Transaksi</th>
                  <th className="pb-3 font-bold">Nama Tamu</th>
                  <th className="pb-3 font-bold">Akomodasi & Kamar</th>
                  <th className="pb-3 font-bold">Menginap (Check-In / Out)</th>
                  <th className="pb-3 font-bold text-right">Volume Harga</th>
                  <th className="pb-3 font-bold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-800/10 print:divide-slate-300 font-sans">
                {bookings.map((b) => (
                  <tr key={b.id} className="text-slate-600 font-medium print:text-slate-800">
                    <td className="py-3.5 font-mono font-semibold text-slate-500 print:text-slate-700">{b.booking_code}</td>
                    <td className="py-3.5">{new Date(b.created_at).toLocaleString('id-ID')}</td>
                    <td className="py-3.5">{b.guest_name}</td>
                    <td className="py-3.5">
                      <span className="font-bold text-slate-800 print:text-slate-900 block">{b.room_type?.property?.name}</span>
                      <span className="text-[10px] text-slate-500 block">{b.room_type?.name}</span>
                    </td>
                    <td className="py-3.5">
                      {b.check_in} s/d {b.check_out} ({b.nights} malam)
                    </td>
                    <td className="py-3.5 font-extrabold text-[#3f6239] print:text-slate-900 text-right text-sm">
                      Rp {new Intl.NumberFormat('id-ID').format(b.total_price)}
                    </td>
                    <td className="py-3.5 text-center">
                      <span className={`inline-block font-bold text-[9px] uppercase px-2 py-0.5 rounded-full border ${getStatusClass(b.status)}`}>
                        {getStatusLabel(b.status)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Footer (Hidden during Print) */}
          {pagination.last_page > 1 && (
            <div className="print:hidden flex justify-between items-center pt-4 border-t border-emerald-800/10 mt-4 text-xs font-sans">
              <button
                disabled={pagination.current_page === 1}
                onClick={() => fetchReportData(pagination.current_page - 1)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold border border-slate-250 disabled:opacity-50 transition cursor-pointer"
              >
                Sebelumnya
              </button>
              <span className="text-slate-500 font-medium">Halaman {pagination.current_page} dari {pagination.last_page}</span>
              <button
                disabled={pagination.current_page === pagination.last_page}
                onClick={() => fetchReportData(pagination.current_page + 1)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 rounded-xl text-slate-700 font-bold border border-slate-250 disabled:opacity-50 transition cursor-pointer"
              >
                Berikutnya
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
