import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { ArrowLeft, BedDouble, Plus, Trash2, Edit, Upload, Save, X, Loader2, Square, Users } from 'lucide-react';

const AMENITY_OPTIONS = [
  { value: 'ac', label: 'AC' },
  { value: 'tv', label: 'TV Kabel' },
  { value: 'wifi', label: 'Free WiFi' },
  { value: 'hot_water', label: 'Air Panas' },
  { value: 'breakfast', label: 'Sarapan Gratis' },
  { value: 'minibar', label: 'Mini Bar' },
];

const RoomTypeListPage = () => {
  const { id: propertyId } = useParams(); // Property ID
  const navigate = useNavigate();

  // States
  const [property, setProperty] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form toggle states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null); // null means create

  // Form input fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('2');
  const [sizeSqm, setSizeSqm] = useState('');
  const [priceWeekday, setPriceWeekday] = useState('');
  const [priceWeekend, setPriceWeekend] = useState('');
  const [stock, setStock] = useState('1');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [status, setStatus] = useState('available');

  // File upload state for selected room
  const [uploadingForId, setUploadingForId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(null);

  useEffect(() => {
    fetchPropertyAndRooms();
  }, [propertyId]);

  const fetchPropertyAndRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const propResponse = await api.get(`/manager/properties/${propertyId}`);
      setProperty(propResponse.data);
      
      const roomsResponse = await api.get(`/manager/properties/${propertyId}/room-types`);
      setRoomTypes(roomsResponse.data);
    } catch (err) {
      console.error('Error fetching room types data:', err);
      setError('Gagal memuat tipe kamar.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setCapacity('2');
    setSizeSqm('');
    setPriceWeekday('');
    setPriceWeekend('');
    setStock('1');
    setSelectedAmenities([]);
    setStatus('available');
    setShowForm(true);
  };

  const handleOpenEdit = (room) => {
    setEditId(room.id);
    setName(room.name);
    setDescription(room.description || '');
    setCapacity(String(room.capacity));
    setSizeSqm(room.size_sqm || '');
    setPriceWeekday(String(room.price_weekday));
    setPriceWeekend(String(room.price_weekend));
    setStock(String(room.stock));
    setSelectedAmenities(room.amenities || []);
    setStatus(room.status);
    setShowForm(true);
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(item => item !== amenity) : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    const payload = {
      name,
      description,
      capacity: parseInt(capacity),
      size_sqm: sizeSqm ? parseFloat(sizeSqm) : null,
      price_weekday: parseFloat(priceWeekday),
      price_weekend: parseFloat(priceWeekend),
      stock: parseInt(stock),
      amenities: selectedAmenities,
      status
    };

    try {
      if (editId) {
        await api.post(`/manager/room-types/${editId}`, payload); // POST with payload to handle updates
      } else {
        await api.post(`/manager/properties/${propertyId}/room-types`, payload);
      }
      
      setShowForm(false);
      fetchPropertyAndRooms();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan tipe kamar.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (roomId, roomName) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus tipe kamar "${roomName}"?`)) return;

    try {
      await api.delete(`/manager/room-types/${roomId}`);
      fetchPropertyAndRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus tipe kamar.');
    }
  };

  const handleFilesChange = (e) => {
    setSelectedFiles(e.target.files);
  };

  const handleUploadImages = async (roomId) => {
    if (!selectedFiles || selectedFiles.length === 0) {
      alert('Harap pilih gambar terlebih dahulu.');
      return;
    }

    setUploadingForId(roomId);
    const formData = new FormData();
    for (let i = 0; i < selectedFiles.length; i++) {
      formData.append('images[]', selectedFiles[i]);
    }

    try {
      await api.post(`/manager/room-types/${roomId}/images`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSelectedFiles(null);
      // Reset input element
      const fileInput = document.getElementById(`file-input-${roomId}`);
      if (fileInput) fileInput.value = '';
      
      fetchPropertyAndRooms();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengunggah foto kamar.');
    } finally {
      setUploadingForId(null);
    }
  };

  if (loading && !property) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 font-sans">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-[#3f6239] rounded-full animate-spin"></div>
          <Loader2 size={24} className="animate-spin text-[#3f6239] absolute" />
        </div>
        <p className="text-slate-655 text-sm font-bold animate-pulse">Memuat rincian tipe kamar...</p>
      </div>
    );
  }

  return (
    <div className="py-6 space-y-6 px-4 md:px-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/manager/properties')}
          className="text-xs text-slate-555 hover:text-slate-800 flex items-center gap-1 transition cursor-pointer"
        >
          <ArrowLeft size={14} /> Kembali ke Properti
        </button>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <BedDouble className="text-[#3f6239]" /> Kelola Kamar — {property?.name}
          </h1>
          <p className="text-sm text-slate-500">Atur harga weekday/weekend, kapasitas tamu, stok kamar, dan galeri foto kamar.</p>
        </div>
        
        {!showForm && (
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-1.5 bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-sm shrink-0 cursor-pointer font-sans"
          >
            <Plus size={14} /> Tambah Tipe Kamar
          </button>
        )}
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* Inline Room Form */}
      {showForm && (
        <div className="glass-panel p-6 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md space-y-4 relative font-sans">
          <button
            onClick={() => setShowForm(false)}
            className="absolute top-4 right-4 text-slate-450 hover:text-slate-700 cursor-pointer transition"
          >
            <X size={18} />
          </button>
          
          <h2 className="text-base font-bold text-slate-850">
            {editId ? 'Ubah Tipe Kamar' : 'Tambah Tipe Kamar Baru'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Nama Tipe Kamar</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Deluxe Room, Suite Cottage"
                  className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Status Ketersediaan</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm cursor-pointer"
                >
                  <option value="available">Tersedia (Active)</option>
                  <option value="unavailable">Penuh / Tidak Tersedia</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Harga Weekday (Rp)</label>
                <input
                  type="number"
                  required
                  value={priceWeekday}
                  onChange={(e) => setPriceWeekday(e.target.value)}
                  placeholder="e.g. 350000"
                  className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Harga Weekend (Rp)</label>
                <input
                  type="number"
                  required
                  value={priceWeekend}
                  onChange={(e) => setPriceWeekend(e.target.value)}
                  placeholder="e.g. 450000"
                  className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Kapasitas Tamu</label>
                <input
                  type="number"
                  required
                  value={capacity}
                  min="1"
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Stok Kamar</label>
                <input
                  type="number"
                  required
                  value={stock}
                  min="0"
                  onChange={(e) => setStock(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Luas Kamar (m²)</label>
                <input
                  type="number"
                  value={sizeSqm}
                  onChange={(e) => setSizeSqm(e.target.value)}
                  placeholder="e.g. 24"
                  className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
                />
              </div>
              <div className="sm:col-span-3">
                <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Deskripsi Kamar</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Kamar mandi dalam dengan air hangat, menghadap langsung ke perbukitan teh."
                  className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-[#3f6239] focus:ring-1 focus:ring-[#3f6239] focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Amenities checklist */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase mb-1.5">Fasilitas Kamar</label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 bg-slate-50 p-3 rounded-xl border border-emerald-800/10 shadow-sm">
                {AMENITY_OPTIONS.map((item) => (
                  <label key={item.value} className="flex items-center gap-1.5 text-[10px] text-slate-650 hover:text-slate-850 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(item.value)}
                      onChange={() => handleAmenityChange(item.value)}
                      className="rounded border-emerald-800/15 text-[#3f6239] focus:ring-0 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold px-4 py-2.5 rounded-xl transition cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {saving ? (
                <>
                  <Loader2 size={12} className="animate-spin" /> Menyimpan...
                </>
              ) : (
                <>
                  <Save size={12} /> Simpan Kamar
                </>
              )}
            </button>
          </form>
        </div>
      )}

      {/* Room Types Listing */}
      {roomTypes.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl text-slate-655 bg-white/95 border border-emerald-800/10 font-bold font-sans">
          Belum ada tipe kamar yang terdaftar.
        </div>
      ) : (
        <div className="space-y-6 font-sans">
          {roomTypes.map((room) => (
            <div key={room.id} className="glass-panel p-5 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md flex flex-col lg:flex-row gap-6">
              {/* Left detail info */}
              <div className="flex-1 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{room.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{room.description || 'Tidak ada deskripsi.'}</p>
                  </div>
                  <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border shrink-0 ${
                    room.status === 'available'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {room.status === 'available' ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-emerald-800/10 shadow-sm">
                  <div>
                    <span className="text-slate-555 block font-semibold">Weekday / Weekend Price</span>
                    <span className="font-extrabold text-[#3f6239] text-sm">
                      Rp {new Intl.NumberFormat('id-ID').format(room.price_weekday)}
                    </span>
                    <span className="text-slate-500 font-medium text-[10px]"> / Rp {new Intl.NumberFormat('id-ID').format(room.price_weekend)}</span>
                  </div>
                  <div>
                    <span className="text-slate-555 block font-semibold">Stok Kamar</span>
                    <span className="font-bold text-slate-800">{room.stock} Kamar</span>
                  </div>
                  <div>
                    <span className="text-slate-555 block font-semibold">Maks Tamu</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1"><Users size={12} /> {room.capacity} Tamu</span>
                  </div>
                  <div>
                    <span className="text-slate-555 block font-semibold">Luas Kamar</span>
                    <span className="font-bold text-slate-800 flex items-center gap-1">
                      <Square size={12} /> {room.size_sqm ? `${room.size_sqm} m²` : '-'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {room.amenities && room.amenities.map((amenity, idx) => (
                    <span key={idx} className="text-[10px] px-2.5 py-1 bg-white text-[#3f6239] rounded-full border border-emerald-800/10 shadow-sm font-bold">
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Edit & Delete actions */}
                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl border border-slate-250 transition cursor-pointer shadow-sm"
                  >
                    <Edit size={12} /> Edit Kamar
                  </button>
                  <button
                    onClick={() => handleDelete(room.id, room.name)}
                    className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-750 text-xs font-bold px-3 py-2 rounded-xl border border-red-200 transition cursor-pointer shadow-sm"
                  >
                    <Trash2 size={12} /> Hapus
                  </button>
                </div>
              </div>

              {/* Right image photo upload / view */}
              <div className="w-full lg:w-72 flex flex-col space-y-3 shrink-0 lg:border-l lg:border-emerald-800/10 lg:pl-6">
                <span className="text-[10px] font-bold text-slate-550 uppercase tracking-wide">Galeri Kamar (Maks. 5)</span>
                
                {/* Horizontal simple list */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                  {room.images && room.images.map((img) => (
                    <div key={img.id} className="w-14 h-10 rounded-lg border border-emerald-800/10 overflow-hidden bg-slate-100 shrink-0 shadow-sm">
                      <img src={`http://127.0.0.1:8000/storage/${img.image_path}`} alt="Room" className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {(!room.images || room.images.length === 0) && (
                    <span className="text-[10px] text-slate-400 font-medium">Belum ada gambar terunggah.</span>
                  )}
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-emerald-800/10 flex flex-col gap-2 shadow-sm">
                  <input
                    id={`file-input-${room.id}`}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFilesChange}
                    className="w-full text-[10px] text-slate-500 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-[9px] file:font-semibold file:bg-slate-200 file:text-slate-700 cursor-pointer"
                  />
                  <button
                    onClick={() => handleUploadImages(room.id)}
                    disabled={uploadingForId === room.id}
                    className="w-full flex items-center justify-center gap-1.5 bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold py-2 rounded-xl text-[10px] uppercase tracking-wider transition cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {uploadingForId === room.id ? (
                      <>
                        <Loader2 size={10} className="animate-spin" /> Mengunggah...
                      </>
                    ) : (
                      <>
                        <Upload size={10} /> Unggah Foto
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RoomTypeListPage;
