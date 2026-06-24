import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 max-w-md mx-auto text-center overflow-hidden">
      {/* Background glow source */}
      <div className="glow-sphere w-64 h-64 bg-emerald-800/5 top-1/4 left-1/4"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-panel py-12 px-8 rounded-2xl relative overflow-hidden border border-emerald-800/10 bg-white/95 space-y-6 shadow-md z-10 w-full"
      >
        {/* Decorative ambient gradients */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-800/5 rounded-full blur-2xl -mr-10 -mt-10"></div>

        <div className="relative z-10 space-y-4">
          <div className="relative flex items-center justify-center mx-auto w-20 h-20 bg-[#eef3ee] rounded-full border border-emerald-800/10">
            <div className="absolute w-12 h-12 bg-emerald-800/10 rounded-full animate-ping"></div>
            <HelpCircle size={40} className="text-[#3f6239] relative" />
          </div>

          <div className="space-y-2">
            <h1 className="text-6xl font-extrabold text-[#3f6239] tracking-tight leading-none">
              404
            </h1>
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Halaman Tidak Ditemukan
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto font-medium">
              Maaf, halaman yang Anda cari tidak tersedia, dinonaktifkan, atau alamat URL yang Anda masukkan salah.
            </p>
          </div>

          <div className="pt-4">
            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full py-3.5 px-4 rounded-xl bg-[#3f6239] hover:bg-[#304d2c] text-white text-xs font-bold transition-all uppercase tracking-wider shadow-md shadow-emerald-800/10 hover:shadow-lg cursor-pointer"
            >
              <ArrowLeft size={14} /> Kembali ke Beranda
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;
