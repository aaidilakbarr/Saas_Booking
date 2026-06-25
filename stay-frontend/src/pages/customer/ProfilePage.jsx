import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { User, Phone, Upload, Loader2, CheckCircle2 } from 'lucide-react';

const ProfilePage = () => {
  const { user, updateProfile, isLoading, error, clearError } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess('');
    clearError();

    try {
      await updateProfile(name, phone, avatar);
      setSuccess('Profil Anda berhasil diperbarui!');
      setAvatar(null); // Reset file input
    } catch (err) {
      // Handled by store
    }
  };

  return (
    <div className="relative py-8 max-w-xl mx-auto space-y-6 overflow-hidden px-4 sm:px-6">
      {/* Glow effects */}
      <div className="glow-sphere w-72 h-72 bg-emerald-800/5 top-1/4 left-1/4"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-1 relative z-10"
      >
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Profil Saya</h1>
        <p className="text-xs text-slate-500">Perbarui data diri Anda dan pasang foto profil terbaik.</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-panel py-8 px-6 sm:px-10 rounded-2xl border border-emerald-800/10 bg-white/95 shadow-md relative overflow-hidden z-10"
      >
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-800/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

        {success && (
          <div className="mb-6 p-4 rounded-xl border border-emerald-205/60 bg-emerald-50 text-emerald-800 text-xs flex gap-2 items-center shadow-sm">
            <CheckCircle2 size={16} className="text-ptpn-700 shrink-0" />
            <span className="font-medium">{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-655 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10 text-xs">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-3 pb-4 border-b border-emerald-800/10">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-100 border-2 border-emerald-800/10 relative group shrink-0 shadow-sm">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
              ) : user?.avatar ? (
                <img src={`http://127.0.0.1:8000/storage/${user.avatar}`} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl font-extrabold text-ptpn-700 bg-[#eef3ee]">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <button
                type="button"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-emerald-800/10 bg-[#f4f7f4]/80 text-slate-700 text-[10px] font-bold uppercase tracking-wider hover:text-slate-900 hover:bg-[#eef3ee] transition cursor-pointer"
              >
                <Upload size={12} className="text-ptpn-700" /> Ganti Foto Profil
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Nama Lengkap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User size={16} />
              </div>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm placeholder-slate-400"
                placeholder="Nama Lengkap"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Nomor Telepon
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone size={16} />
              </div>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm placeholder-slate-400"
                placeholder="Nomor Telepon"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-emerald-800/10 hover:shadow-lg text-xs font-bold text-white bg-ptpn-700 hover:bg-ptpn-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-800 disabled:opacity-50 transition-all uppercase tracking-wider cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> Menyimpan...
                </span>
              ) : (
                'Simpan Perubahan'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfilePage;
