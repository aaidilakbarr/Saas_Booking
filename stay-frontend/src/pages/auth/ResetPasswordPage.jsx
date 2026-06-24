import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../../lib/axios';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';

const ResetPasswordPage = () => {
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get('token');
  const email = queryParams.get('email');

  useEffect(() => {
    if (!token || !email) {
      setError('Token atur ulang kata sandi tidak valid atau hilang.');
    }
  }, [token, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirmation) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 8) {
      setError('Kata sandi minimal harus 8 karakter.');
      return;
    }

    setIsLoading(true);
    try {
      await api.post('/auth/reset-password', {
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengatur ulang kata sandi. Tautan mungkin kadaluarsa.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex-1 flex flex-col justify-center py-12 max-w-md mx-auto w-full overflow-hidden px-4 md:px-6">
      {/* Background glow source */}
      <div className="glow-sphere w-64 h-64 bg-emerald-800/5 top-1/4 left-1/4"></div>

      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-2 relative z-10"
      >
        <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">
          Atur Ulang Kata Sandi
        </h2>
        <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed font-medium">
          Buat kata sandi baru Anda yang aman di bawah ini.
        </p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mt-8 relative z-10"
      >
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-2xl relative overflow-hidden border border-emerald-800/10 bg-white/95 shadow-md">
          <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-800/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

          {success ? (
            <div className="text-center py-4 space-y-4 relative z-10 text-xs">
              <div className="flex justify-center text-[#3f6239]">
                <CheckCircle2 size={40} className="text-[#3f6239]" />
              </div>
              <h3 className="text-base font-bold text-slate-800 uppercase tracking-wider">Berhasil Diatur Ulang!</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Kata sandi baru Anda telah berhasil diperbarui. Silakan gunakan kata sandi baru untuk masuk.
              </p>
              <div className="pt-4">
                <Link
                  to="/login"
                  className="w-full flex justify-center py-3.5 px-4 rounded-xl bg-[#3f6239] hover:bg-[#304d2c] text-white text-xs font-bold transition-all uppercase tracking-wider shadow-md shadow-emerald-800/10 hover:shadow-lg cursor-pointer"
                >
                  Masuk Sekarang
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-5 relative z-10 text-xs" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-650 text-xs font-medium">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={!token || !email}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm placeholder-slate-400 disabled:opacity-50"
                    placeholder="Min. 8 karakter"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="passwordConfirmation" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    id="passwordConfirmation"
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={!token || !email}
                    value={passwordConfirmation}
                    onChange={(e) => setPasswordConfirmation(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm placeholder-slate-400 disabled:opacity-50"
                    placeholder="Ulangi kata sandi baru"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !token || !email}
                  className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-emerald-800/10 hover:shadow-lg text-xs font-bold text-white bg-[#3f6239] hover:bg-[#304d2c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-800 disabled:opacity-50 transition-all uppercase tracking-wider cursor-pointer"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" /> Memproses...
                    </span>
                  ) : (
                    'Atur Ulang Kata Sandi'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;
