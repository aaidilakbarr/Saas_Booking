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
        return <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">Manager</span>;
      case 'finance':
        return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Finance</span>;
      default:
        return <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">Customer</span>;
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#f4f7f4]/80 backdrop-blur-md border-b border-emerald-500/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex flex-col cursor-pointer">
              <span className="text-2xl font-black tracking-wider bg-gradient-to-r from-emerald-800 to-emerald-600 bg-clip-text text-transparent font-sans">
                STAY
              </span>
              <span className="text-[9px] text-slate-500 font-extrabold uppercase tracking-widest mt-[-4px]">
                by PTPN IV
              </span>
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/"
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                isActive('/') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/search"
              className={`text-sm font-semibold transition-colors cursor-pointer ${
                isActive('/search') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
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
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isActive('/account/bookings') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
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
                      className={`text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        isActive('/manager/dashboard') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
                      }`}
                    >
                      <BarChart2 size={16} /> Dashboard
                    </Link>
                    <Link
                      to="/manager/properties"
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isActive('/manager/properties') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
                      }`}
                    >
                      Kelola Properti
                    </Link>
                    <Link
                      to="/manager/bookings"
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isActive('/manager/bookings') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
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
                      className={`text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                        isActive('/finance/dashboard') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
                      }`}
                    >
                      <TrendingUp size={16} /> Dashboard
                    </Link>
                    <Link
                      to="/finance/payments"
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isActive('/finance/payments') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
                      }`}
                    >
                      Antrian Bayar
                    </Link>
                    <Link
                      to="/manager/bookings"
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isActive('/manager/bookings') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
                      }`}
                    >
                      Reservasi
                    </Link>
                    <Link
                      to="/finance/reports"
                      className={`text-sm font-semibold transition-colors cursor-pointer ${
                        isActive('/finance/reports') ? 'text-emerald-700 font-bold' : 'text-slate-650 hover:text-emerald-700'
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
                  className="flex items-center gap-2 text-sm bg-white/90 px-3.5 py-1.5 rounded-full border border-emerald-500/10 hover:bg-white transition cursor-pointer shadow-sm"
                >
                  {user.avatar ? (
                    <img
                      src={`http://127.0.0.1:8000/storage/${user.avatar}`}
                      alt={user.name}
                      className="w-6 h-6 rounded-full object-cover border border-emerald-600"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-700">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-slate-700 font-semibold">{user.name.split(' ')[0]}</span>
                  {getRoleBadge(user.role)}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white border border-emerald-500/10 shadow-xl py-1 z-50">
                    {user.role === 'customer' && (
                      <Link
                        to="/account/profile"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-750 hover:bg-emerald-50/50 hover:text-emerald-800 transition cursor-pointer"
                      >
                        <UserIcon size={16} className="text-emerald-600" /> Profil Saya
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50/50 transition cursor-pointer font-semibold"
                    >
                      <LogOut size={16} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-bold text-slate-700 hover:text-emerald-700 px-3 py-2 transition cursor-pointer"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-bold bg-emerald-700 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-full transition shadow-sm cursor-pointer"
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
              className="text-slate-600 hover:text-emerald-750 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white/95 border-b border-emerald-500/10 px-2 pt-2 pb-4 space-y-1 shadow-inner">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
          >
            Beranda
          </Link>
          <Link
            to="/search"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
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
                    className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
                  >
                    Riwayat Booking
                  </Link>
                  <Link
                    to="/account/profile"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
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
                    className="block px-3 py-2 rounded-md text-base font-semibold text-emerald-800 hover:bg-emerald-50/50"
                  >
                    Dashboard Manager
                  </Link>
                  <Link
                    to="/manager/properties"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
                  >
                    Kelola Properti
                  </Link>
                  <Link
                    to="/manager/bookings"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
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
                    className="block px-3 py-2 rounded-md text-base font-semibold text-emerald-800 hover:bg-emerald-50/50"
                  >
                    Dashboard Finance
                  </Link>
                  <Link
                    to="/finance/payments"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
                  >
                    Antrian Pembayaran
                  </Link>
                  <Link
                    to="/manager/bookings"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
                  >
                    Reservasi
                  </Link>
                  <Link
                    to="/finance/reports"
                    onClick={() => setIsOpen(false)}
                    className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-emerald-50/50 hover:text-emerald-800"
                  >
                    Laporan
                  </Link>
                </>
              )}

              <hr className="border-slate-100 my-2" />
              <div className="px-3 py-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">{user.name}</span>
                {getRoleBadge(user.role)}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-md text-base font-semibold text-red-650 hover:bg-red-50/50 cursor-pointer"
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
                className="text-center w-full block py-2.5 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold"
              >
                Masuk
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-center w-full block py-2.5 rounded-full bg-emerald-700 text-white hover:bg-emerald-600 font-bold"
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
