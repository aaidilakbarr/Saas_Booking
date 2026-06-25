import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { User, Mail, Lock, Phone, Eye, EyeOff, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const { register, isLoading, error, clearError, isAuthenticated } = useAuthStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validationError, setValidationError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (password !== passwordConfirmation) {
      setValidationError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    if (password.length < 8) {
      setValidationError('Kata sandi minimal harus 8 karakter.');
      return;
    }

    try {
      await register(name, email, password, passwordConfirmation, phone);
      navigate('/');
    } catch (err) {
      // Handled by store
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
          Daftar Akun Baru
        </h2>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-ptpn-700 hover:text-ptpn-800 transition">
            Masuk di sini
          </Link>
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

          {(validationError || error) && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-650 text-xs font-medium">
              {validationError || error}
            </div>
          )}

          <form className="space-y-4 relative z-10 text-xs" onSubmit={handleSubmit}>
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
                  placeholder="Nama Lengkap Anda"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Alamat Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={16} />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm placeholder-slate-400"
                  placeholder="name@stay.com"
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
                  placeholder="08123456789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm placeholder-slate-400"
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
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="passwordConfirmation"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm placeholder-slate-400"
                  placeholder="Ulangi kata sandi"
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
                    <Loader2 size={14} className="animate-spin" /> Memproses...
                  </span>
                ) : (
                  'Daftar Akun'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
