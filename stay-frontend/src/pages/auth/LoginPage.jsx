import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

const LoginPage = () => {
  const { login, isLoading, error, clearError, isAuthenticated, user } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    clearError();
    // Check if redirect due to expired session
    const params = new URLSearchParams(location.search);
    if (params.get('expired')) {
      setSessionExpired(true);
    }
  }, [location, clearError]);

  // If already logged in, redirect appropriate home
  useEffect(() => {
    if (isAuthenticated && user) {
      redirectUser(user.role);
    }
  }, [isAuthenticated, user]);

  const redirectUser = (role) => {
    const from = location.state?.from?.pathname;
    if (from) {
      navigate(from, { replace: true });
      return;
    }

    if (role === 'property_manager') {
      navigate('/manager/dashboard');
    } else if (role === 'finance') {
      navigate('/finance/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const loggedUser = await login(email, password);
      redirectUser(loggedUser.role);
    } catch (err) {
      // Handled by store state
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
          Selamat Datang Kembali
        </h2>
        <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">
          Atau{' '}
          <Link to="/register" className="font-bold text-[#3f6239] hover:text-[#304d2c] transition">
            Buat akun customer baru
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

          {sessionExpired && (
            <div className="mb-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs font-medium">
              Sesi Anda telah berakhir. Silakan masuk kembali.
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-650 text-xs font-medium">
              {error}
            </div>
          )}

          <form className="space-y-5 relative z-10 text-xs" onSubmit={handleSubmit}>
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
                  name="email"
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
              <label htmlFor="password" className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={16} />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-white border border-emerald-800/15 rounded-xl text-slate-800 text-xs focus:border-emerald-800 focus:ring-1 focus:ring-emerald-800 focus:outline-none transition-all shadow-sm placeholder-slate-400"
                  placeholder="••••••••"
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

            <div className="flex items-center justify-end text-xs">
              <Link to="/forgot-password" className="font-bold text-[#3f6239] hover:text-[#304d2c] transition">
                Lupa kata sandi?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-md shadow-emerald-800/10 hover:shadow-lg text-xs font-bold text-white bg-[#3f6239] hover:bg-[#304d2c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-800 disabled:opacity-50 transition-all uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={14} className="animate-spin" /> Memproses...
                  </span>
                ) : (
                  'Masuk'
                )}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
