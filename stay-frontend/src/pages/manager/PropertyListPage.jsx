import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Plus, Hotel, MapPin, Eye, Edit, Trash2, BedDouble, Loader2 } from 'lucide-react';

const PropertyListPage = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const response = await api.get('/manager/properties');
      setProperties(response.data);
    } catch (err) {
      console.error('Error fetching manager properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus properti "${name}"? Semua tipe kamar dan galeri foto terkait akan ikut terhapus.`)) return;

    try {
      await api.delete(`/manager/properties/${id}`);
      fetchProperties();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus properti.');
    }
  };

  return (
    <div className="py-6 space-y-6 px-4 md:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Hotel className="text-[#3f6239]" /> Daftar Properti Kelolaan
          </h1>
          <p className="text-sm text-slate-500">Kelola rincian hotel, villa, homestay, serta kelola kamar Anda.</p>
        </div>
        
        <button
          onClick={() => navigate('/manager/properties/create')}
          className="flex items-center gap-1.5 bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider cursor-pointer shadow-md hover:shadow-lg transition font-sans"
        >
          <Plus size={14} /> Tambah Properti
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4 font-sans">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-[#3f6239] rounded-full animate-spin"></div>
            <Loader2 size={24} className="animate-spin text-[#3f6239] absolute" />
          </div>
          <p className="text-slate-655 text-sm font-bold animate-pulse">Memuat daftar properti Anda...</p>
        </div>
      ) : properties.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl space-y-4 text-slate-650 bg-white/95 border border-emerald-800/10 font-bold font-sans">
          <p>Anda belum mendaftarkan properti penginapan apa pun.</p>
          <button
            onClick={() => navigate('/manager/properties/create')}
            className="inline-flex bg-[#3f6239] hover:bg-[#304d2c] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-sm"
          >
            Mulai Tambah Properti
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-sans">
          {properties.map((property) => (
            <div
              key={property.id}
              className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-emerald-800/10 bg-white/95 shadow-md"
            >
              {/* Image & Type info */}
              <div className="aspect-[16/9] bg-slate-100 relative shrink-0">
                {property.thumbnail ? (
                  <img
                    src={`http://127.0.0.1:8000/storage/${property.thumbnail}`}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold text-xs">
                    Belum Ada Gambar Utama
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/90 border border-emerald-800/10 text-[#3f6239] shadow-sm">
                    {property.type}
                  </span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    property.status === 'active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {property.status === 'active' ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-800 leading-snug line-clamp-1">
                    {property.name}
                  </h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <MapPin size={12} className="text-[#3f6239]" /> {property.city}, {property.province}
                  </p>
                </div>

                {/* Actions row */}
                <div className="pt-4 border-t border-emerald-800/10 flex flex-wrap gap-2 items-center justify-between mt-4">
                  <button
                    onClick={() => navigate(`/manager/properties/${property.id}/rooms`)}
                    className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-[#3f6239] border border-emerald-200 text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
                  >
                    <BedDouble size={14} /> Kelola Kamar
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/manager/properties/${property.id}/edit`)}
                      className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-250 text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
                    >
                      <Edit size={12} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(property.id, property.name)}
                      className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-[10px] uppercase tracking-wider font-bold px-3 py-2 rounded-xl transition cursor-pointer shadow-sm"
                    >
                      <Trash2 size={12} /> Hapus
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PropertyListPage;
