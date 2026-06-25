import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ArrowLeft, Upload, Loader2, Hotel, Save } from 'lucide-react';

const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'Free WiFi' },
  { value: 'parking', label: 'Tempat Parkir' },
  { value: 'pool', label: 'Kolam Renang' },
  { value: 'ac', label: 'AC' },
  { value: 'hot_water', label: 'Air Panas' },
  { value: 'restaurant', label: 'Restoran' },
  { value: 'gym', label: 'Pusat Kebugaran' },
  { value: 'meeting_room', label: 'Ruang Rapat' },
];

const PropertyFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  // States
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState('hotel');
  const [status, setStatus] = useState('active');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  useEffect(() => {
    if (isEdit) {
      fetchPropertyDetails();
    }
  }, [id]);

  const fetchPropertyDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/manager/properties/${id}`);
      const p = response.data;
      setName(p.name);
      setType(p.type);
      setStatus(p.status);
      setAddress(p.address);
      setCity(p.city);
      setProvince(p.province);
      setLatitude(p.latitude || '');
      setLongitude(p.longitude || '');
      setDescription(p.description || '');
      setSelectedAmenities(p.amenities || []);
      if (p.thumbnail) {
        setThumbnailPreview(`http://127.0.0.1:8000/storage/${p.thumbnail}`);
      }
    } catch (err) {
      console.error('Error fetching property detail:', err);
      setError('Gagal memuat detail properti.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(item => item !== amenity) : [...prev, amenity]
    );
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('status', status);
    formData.append('address', address);
    formData.append('city', city);
    formData.append('province', province);
    if (latitude) formData.append('latitude', latitude);
    if (longitude) formData.append('longitude', longitude);
    if (description) formData.append('description', description);
    
    // Add amenities array
    selectedAmenities.forEach((amenity, idx) => {
      formData.append(`amenities[${idx}]`, amenity);
    });

    if (thumbnail) {
      formData.append('thumbnail', thumbnail);
    }

    try {
      if (isEdit) {
        // Multipart workaround in Laravel (POST to update)
        await api.post(`/manager/properties/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        await api.post('/manager/properties', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      navigate('/manager/properties');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan data properti.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-ptpn-700 rounded-full animate-spin"></div>
          <Loader2 size={24} className="animate-spin text-ptpn-700 absolute" />
        </div>
        <p className="text-slate-655 text-sm font-bold animate-pulse">Memuat formulir...</p>
      </div>
    );
  }

  return (
    <div className="py-6 max-w-3xl mx-auto space-y-6 px-4 md:px-0">
      <div className="flex items-center gap-2">
        <button
          onClick={() => navigate('/manager/properties')}
          className="text-xs text-slate-550 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
        >
          <ArrowLeft size={14} /> Kembali
        </button>
      </div>

      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md space-y-6">
        <div className="flex items-center gap-2 border-b border-emerald-800/10 pb-4">
          <Hotel className="text-ptpn-700" size={24} />
          <h1 className="text-xl font-bold text-slate-800">
            {isEdit ? 'Ubah Informasi Properti' : 'Tambah Properti Baru'}
          </h1>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 text-sm font-sans">
          {/* General Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Properti</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Hotel Agro Wisata Bah Butong"
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Tipe Akomodasi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="hotel">Hotel</option>
                <option value="villa">Villa</option>
                <option value="homestay">Homestay</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Lengkap</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Jl. Perkebunan Teh Sidamanik"
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Status Publikasi</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2.5 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm cursor-pointer"
              >
                <option value="active">Aktif (Publik)</option>
                <option value="inactive">Non-Aktif (Draft)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Kota / Kabupaten</label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Simalungun"
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Provinsi</label>
              <input
                type="text"
                required
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                placeholder="e.g. Sumatera Utara"
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Garis Lintang (Latitude)</label>
              <input
                type="number"
                step="any"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                placeholder="e.g. 2.8719"
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Garis Bujur (Longitude)</label>
              <input
                type="number"
                step="any"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                placeholder="e.g. 99.0712"
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Deskripsi Properti</label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan daya tarik, suasana agro, dan fasilitas penginapan Anda..."
              className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-ptpn-700 focus:ring-1 focus:ring-ptpn-700 focus:outline-none transition-all shadow-sm"
            ></textarea>
          </div>

          {/* Amenities checklist */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Fasilitas Properti</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-emerald-800/10 shadow-sm">
              {AMENITY_OPTIONS.map((item) => (
                <label key={item.value} className="flex items-center gap-2 text-xs text-slate-650 hover:text-slate-850 cursor-pointer font-medium">
                  <input
                    type="checkbox"
                    checked={selectedAmenities.includes(item.value)}
                    onChange={() => handleAmenityChange(item.value)}
                    className="rounded border-emerald-800/15 text-ptpn-700 focus:ring-0 focus:ring-offset-0 w-4 h-4 cursor-pointer"
                  />
                  <span>{item.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Thumbnail image selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Gambar Utama Properti (Thumbnail)</label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-slate-50 border border-emerald-800/10 rounded-xl shadow-sm">
              <div className="w-32 h-20 bg-slate-100 rounded-xl border border-emerald-800/10 overflow-hidden shrink-0 flex items-center justify-center">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[10px] text-slate-400 font-semibold">No Image</span>
                )}
              </div>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-250 bg-white text-slate-700 text-xs font-bold hover:bg-slate-50 cursor-pointer transition shadow-sm"
                >
                  <Upload size={14} /> Pilih Gambar
                </button>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4 border-t border-emerald-800/10">
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-1.5 bg-ptpn-700 hover:bg-ptpn-800 text-white font-bold py-3 rounded-xl transition shadow-md hover:shadow-lg disabled:opacity-50 cursor-pointer font-sans"
            >
              {saving ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={16} /> Simpan Properti
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PropertyFormPage;
