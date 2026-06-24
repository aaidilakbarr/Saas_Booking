import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../lib/axios';
import { Search, MapPin, Star, SlidersHorizontal, Calendar, Users, Loader2 } from 'lucide-react';

const AMENITY_OPTIONS = [
  { value: 'wifi', label: 'Free WiFi' },
  { value: 'parking', label: 'Tempat Parkir' },
  { value: 'pool', label: 'Kolam Renang' },
  { value: 'ac', label: 'AC' },
  { value: 'hot_water', label: 'Air Panas' },
  { value: 'restaurant', label: 'Restoran' },
];

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Load URL query params initially
  const getParams = () => new URLSearchParams(location.search);

  // States
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter form states
  const [query, setQuery] = useState(getParams().get('query') || '');
  const [checkIn, setCheckIn] = useState(getParams().get('check_in') || '');
  const [checkOut, setCheckOut] = useState(getParams().get('check_out') || '');
  const [guests, setGuests] = useState(getParams().get('guests') || '1');
  const [type, setType] = useState(getParams().get('type') || '');
  const [minPrice, setMinPrice] = useState(getParams().get('min_price') || '');
  const [maxPrice, setMaxPrice] = useState(getParams().get('max_price') || '');
  const [selectedAmenities, setSelectedAmenities] = useState(
    getParams().get('amenities') ? getParams().get('amenities').split(',') : []
  );
  const [rating, setRating] = useState(getParams().get('rating') || '');

  // Refetch when location search changes
  useEffect(() => {
    const fetchFiltered = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(location.search);
        const response = await api.get(`/properties?${params.toString()}`);
        setProperties(response.data);
      } catch (err) {
        console.error('Error fetching search results:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFiltered();
  }, [location.search]);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    
    if (query) params.append('query', query);
    if (checkIn) params.append('check_in', checkIn);
    if (checkOut) params.append('check_out', checkOut);
    if (guests) params.append('guests', guests);
    if (type) params.append('type', type);
    if (minPrice) params.append('min_price', minPrice);
    if (maxPrice) params.append('max_price', maxPrice);
    if (selectedAmenities.length > 0) params.append('amenities', selectedAmenities.join(','));
    if (rating) params.append('rating', rating);

    navigate(`/search?${params.toString()}`);
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities(prev => 
      prev.includes(amenity) ? prev.filter(item => item !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setQuery('');
    setCheckIn('');
    setCheckOut('');
    setGuests('1');
    setType('');
    setMinPrice('');
    setMaxPrice('');
    setSelectedAmenities([]);
    setRating('');
    navigate('/search');
  };

  return (
    <div className="py-6 space-y-6 px-4 md:px-6">
      {/* Top Search Bar */}
      <div className="glass-panel p-4 rounded-2xl bg-white/95 border border-emerald-800/10 shadow-md">
        <form onSubmit={handleApplyFilters} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Cari Nama / Lokasi</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Medan, Hotel..."
              className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Check-In</label>
            <input
              type="date"
              value={checkIn}
              onChange={(e) => setCheckIn(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Check-Out</label>
            <input
              type="date"
              value={checkOut}
              onChange={(e) => setCheckOut(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm"
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1.5">Tamu</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
              >
                <option value="1">1 Tamu</option>
                <option value="2">2 Tamu</option>
                <option value="4">4 Tamu</option>
                <option value="6">6+ Tamu</option>
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold px-5 rounded-xl text-sm transition-all shadow-md shadow-emerald-800/10 hover:shadow-lg cursor-pointer"
            >
              Cari
            </button>
          </div>
        </form>
      </div>

      {/* Main Grid: Filters Sidebar + Results */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <div className="glass-panel p-5 rounded-2xl bg-white/95 border border-emerald-800/10 shadow-md space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-emerald-800/10 pb-3">
              <h2 className="text-sm font-bold text-slate-850 flex items-center gap-1.5 uppercase tracking-wide">
                <SlidersHorizontal size={16} className="text-[#3f6239]" /> Filter Pencarian
              </h2>
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-450 hover:text-[#3f6239] font-semibold transition cursor-pointer"
              >
                Reset
              </button>
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Tipe Penginapan</h3>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
              >
                <option value="">Semua Tipe</option>
                <option value="hotel">Hotel</option>
                <option value="villa">Villa</option>
                <option value="homestay">Homestay</option>
              </select>
            </div>

            {/* Price Budget */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Range Harga (Rp)</h3>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-1/2 px-2 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Amenities Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Fasilitas Properti</h3>
              <div className="space-y-2">
                {AMENITY_OPTIONS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-xs text-slate-600 hover:text-slate-800 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(item.value)}
                      onChange={() => handleAmenityChange(item.value)}
                      className="rounded border-emerald-800/30 text-[#3f6239] focus:ring-0 focus:ring-offset-0 w-4 h-4"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Rating Minimum</h3>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-sm focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm font-medium cursor-pointer"
              >
                <option value="">Semua Rating</option>
                <option value="5">⭐⭐⭐⭐⭐ (5.0)</option>
                <option value="4">⭐⭐⭐⭐ (4.0+)</option>
                <option value="3">⭐⭐⭐ (3.0+)</option>
              </select>
            </div>

            <button
              onClick={() => handleApplyFilters()}
              className="w-full bg-[#3f6239] hover:bg-[#304d2c] text-white font-bold py-2.5 rounded-xl text-xs transition-all uppercase tracking-wider cursor-pointer shadow-md shadow-emerald-800/10 hover:shadow-lg"
            >
              Terapkan Filter
            </button>
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-emerald-800/10">
            <span className="text-sm font-semibold text-slate-500">
              Menampilkan {properties.length} properti yang cocok
            </span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-emerald-800/20 border-t-[#3f6239] rounded-full animate-spin"></div>
                <Loader2 size={24} className="animate-spin text-[#3f6239] absolute" />
              </div>
              <p className="text-slate-600 text-sm font-medium animate-pulse">Mencari penginapan terbaik...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="glass-panel p-12 rounded-2xl text-center border border-emerald-800/10 bg-white/95">
              <p className="text-slate-700 font-bold">Tidak ada akomodasi yang cocok dengan kriteria Anda.</p>
              <p className="text-xs text-slate-500 mt-1">Coba kurangi filter atau periksa ejaan pencarian Anda.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {properties.map((property) => (
                <div
                  key={property.id}
                  className="glass-panel rounded-2xl overflow-hidden flex flex-col md:flex-row bg-white/95 hover:shadow-xl border border-emerald-800/10 hover:border-emerald-800/25 transition-all duration-300 cursor-pointer"
                  onClick={() => {
                    const params = new URLSearchParams();
                    if (checkIn) params.append('check_in', checkIn);
                    if (checkOut) params.append('check_out', checkOut);
                    navigate(`/property/${property.slug}?${params.toString()}`);
                  }}
                >
                  {/* Thumbnail */}
                  <div className="w-full md:w-60 h-44 bg-slate-100 relative flex-shrink-0">
                    {property.thumbnail ? (
                      <img
                        src={`http://127.0.0.1:8000/storage/${property.thumbnail}`}
                        alt={property.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-400 font-bold text-sm">
                        No Image
                      </div>
                    )}
                    <span className="absolute top-3 left-3 text-[10px] font-extrabold uppercase tracking-widest px-3 py-1.5 rounded-full bg-white text-[#3f6239] border border-emerald-800/15 shadow-sm">
                      {property.type}
                    </span>
                  </div>

                  {/* Body Info */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-bold text-slate-800 leading-snug">{property.name}</h3>
                        <div className="flex items-center gap-1 text-yellow-600 text-xs font-bold bg-[#eef3ee] px-2.5 py-1 rounded-full border border-emerald-800/10">
                          <Star size={14} fill="currentColor" className="text-yellow-500 fill-yellow-500" /> {property.avg_rating || '0.0'}
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                        <MapPin size={12} className="text-[#3f6239]" /> {property.address}, {property.city}
                      </p>
                      
                      {/* Amenities Icons */}
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {property.amenities && property.amenities.slice(0, 4).map((amenity, idx) => (
                          <span key={idx} className="text-[10px] px-2.5 py-1 bg-[#f4f7f4] text-slate-700 font-medium rounded-full border border-emerald-800/5 capitalize">
                            {amenity}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-end justify-between pt-4 border-t border-emerald-800/10 mt-4 font-sans">
                      <div className="text-xs text-slate-500 font-medium">
                        {property.reviews_count || 0} Ulasan
                      </div>
                      
                      {property.lowest_price && (
                        <div className="text-right">
                          <span className="text-[9px] text-slate-450 block uppercase tracking-wider font-semibold">Harga Mulai Dari</span>
                          <span className="text-base font-extrabold text-[#3f6239]">
                            Rp {new Intl.NumberFormat('id-ID').format(property.lowest_price)}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium">/ malam</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
