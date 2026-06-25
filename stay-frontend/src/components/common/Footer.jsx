import React from 'react';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#070b13] border-t border-slate-800 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div className="flex flex-col space-y-4">
            <div>
              <span className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-ptpn-400 to-emerald-500 bg-clip-text text-transparent">
                STAY
              </span>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-[-2px]">
                by PTPN IV
              </p>
            </div>
            <p className="text-sm text-slate-400">
              Sistem booking terpusat untuk hotel, villa, dan homestay milik PTPN IV. Kenyamanan Anda di perkebunan asri dan lokasi wisata prima adalah komitmen kami.
            </p>
          </div>

          {/* Contact Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Kontak Kami
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <MapPin size={16} className="text-ptpn-400" />
                <span>Jl. Letjen Suprapto No.2, Medan, Sumatera Utara</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={16} className="text-ptpn-400" />
                <span>+62 61 4154666</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail size={16} className="text-ptpn-400" />
                <span>stay@ptpn4.co.id</span>
              </li>
            </ul>
          </div>

          {/* Quick Links Column */}
          <div className="flex flex-col space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Tautan Cepat
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="https://www.ptpn4.co.id" target="_blank" rel="noopener noreferrer" className="hover:text-white flex items-center gap-1">
                  <Globe size={14} /> Website Resmi PTPN IV
                </a>
              </li>
              <li>
                <span className="text-slate-500">Syarat & Ketentuan Reservasi</span>
              </li>
              <li>
                <span className="text-slate-500">Kebijakan Privasi</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-900 mt-8 pt-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} PT Perkebunan Nusantara IV (Persero). Hak Cipta Dilindungi Undang-Undang.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
