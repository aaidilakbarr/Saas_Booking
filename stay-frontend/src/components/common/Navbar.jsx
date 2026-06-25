import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Menu, X, User as UserIcon, LogOut, BarChart2, TrendingUp } from 'lucide-react';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    setIsOpen(false);
    setDropdownOpen(false);
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const getRoleBadge = (role) => {
    switch (role) {
      case 'property_manager':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/50 font-medium">Manager</span>;
      case 'finance':
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200/50 font-medium">Finance</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200/50 font-medium">Customer</span>;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#fbfcfd]/80 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex flex-col cursor-pointer group">
              <span className="text-xl font-extrabold tracking-wider text-slate-900 font-sans group-hover:text-teal-600 transition-colors">
                STAY
              </span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-[-4px]">
                by PTPN IV
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isActive('/') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/search"
              className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                isActive('/search') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Cari Penginapan
            </Link>

            {/* Role specific links for desktop */}
            {isAuthenticated && user && (
              <>
                {user.role === 'customer' && (
                  <>
                    <Link
                      to="/account/bookings"
                      className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isActive('/account/bookings') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Riwayat Booking
                    </Link>
                  </>
                )}

                {user.role === 'property_manager' && (
                  <>
                    <Link
                      to="/manager/dashboard"
                      className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isActive('/manager/dashboard') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <BarChart2 size={14} /> Dashboard
                    </Link>
                    <Link
                      to="/manager/properties"
                      className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isActive('/manager/properties') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Kelola Properti
                    </Link>
                    <Link
                      to="/manager/bookings"
                      className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isActive('/manager/bookings') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Reservasi
                    </Link>
                  </>
                )}

                {user.role === 'finance' && (
                  <>
                    <Link
                      to="/finance/dashboard"
                      className={`text-xs font-bold uppercase tracking-wider transition-colors flex items-center gap-1.5 cursor-pointer ${
                        isActive('/finance/dashboard') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <BarChart2 size={14} /> Dashboard
                    </Link>
                    <Link
                      to="/finance/payments"
                      className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isActive('/finance/payments') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Antrian Bayar
                    </Link>
                    <Link
                      to="/manager/bookings"
                      className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isActive('/manager/bookings') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Reservasi
                    </Link>
                    <Link
                      to="/finance/reports"
                      className={`text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer ${
                        isActive('/finance/reports') ? 'text-teal-600' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Laporan
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Desktop User / Auth Button */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-xs font-semibold bg-white/95 px-3.5 py-2 rounded-full border border-slate-100 hover:border-slate-200 transition cursor-pointer shadow-sm"
                >
                  {user.avatar ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${user.avatar}`}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-teal-600/30"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-slate-750 font-semibold">{user.name.split(' ')[0]}</span>
                  {getRoleBadge(user.role)}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white border border-slate-100/80 shadow-xl py-1 z-50 overflow-hidden">
                    {user.role === 'customer' && (
                      <Link
                        to="/account/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition cursor-pointer"
                      >
                        <UserIcon size={14} className="text-slate-500" /> Profil Saya
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2.5 text-xs text-red-600 hover:bg-red-50/50 transition cursor-pointer font-bold"
                    >
                      <LogOut size={14} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-slate-950 px-4 py-2 transition cursor-pointer"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="text-xs font-bold uppercase tracking-wider bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-full transition shadow-sm hover:shadow cursor-pointer"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-500 hover:text-slate-900 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-[#fbfcfd] border-b border-slate-100 px-3 pt-2 pb-5 space-y-1 shadow-inner">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Beranda
          </Link>
          <Link
            to="/search"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
          >
            Cari Penginapan
          </Link>

          {/* Protected mobile links */}
          {isAuthenticated && user && (
            <>
              {user.role === 'customer' && (
                <>
                  <Link
                    to="/account/bookings"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Riwayat Booking
                  </Link>
                  <Link
                    to="/account/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Profil Saya
                  </Link>
                </>
              )}

              {user.role === 'property_manager' && (
                <>
                  <Link
                    to="/manager/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-teal-800 hover:bg-slate-50"
                  >
                    Dashboard Manager
                  </Link>
                  <Link
                    to="/manager/properties"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Kelola Properti
                  </Link>
                  <Link
                    to="/manager/bookings"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Reservasi
                  </Link>
                </>
              )}

              {user.role === 'finance' && (
                <>
                  <Link
                    to="/finance/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-teal-800 hover:bg-slate-50"
                  >
                    Dashboard Finance
                  </Link>
                  <Link
                    to="/finance/payments"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Antrian Pembayaran
                  </Link>
                  <Link
                    to="/manager/bookings"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Reservasi
                  </Link>
                  <Link
                    to="/finance/reports"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Laporan
                  </Link>
                </>
              )}

              <hr className="border-slate-100 my-2" />
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-red-600 hover:bg-red-50/50 cursor-pointer"
              >
                Keluar
              </button>
            </>
          )}

          {!isAuthenticated && (
            <div className="pt-2 flex flex-col gap-2 px-3">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center w-full block py-2.5 rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold uppercase tracking-wider"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-center w-full block py-2.5 rounded-full bg-teal-650 text-white hover:bg-teal-700 text-xs font-bold uppercase tracking-wider"
              >
                Daftar
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;

