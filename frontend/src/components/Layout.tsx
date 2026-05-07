import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X, Wifi, WifiOff } from 'lucide-react';
import { useState } from 'react';
import Sidebar, { navItems } from './Sidebar';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';
import useWebSocket from '../ws/useWebSocket';

export default function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { status } = useWebSocket();

  const handleLogout = async () => {
    try { await api.logout(); } catch { /* ignore */ }
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-bg/80" onClick={() => setMobileOpen(false)} />
          <nav className="relative w-64 h-full bg-surface border-r border-border p-4 flex flex-col gap-1">
            <div className="flex items-center justify-between mb-6">
              <span className="text-lg font-bold tracking-wider text-green">ALPHA</span>
              <button onClick={() => setMobileOpen(false)} className="text-text-muted cursor-pointer">
                <X size={20} />
              </button>
            </div>
            {navItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                    isActive ? 'bg-green/10 text-green' : 'text-text-secondary hover:text-text-primary'
                  }`
                }
              >
                <Icon size={18} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-border bg-surface/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <button onClick={() => setMobileOpen(true)} className="md:hidden text-text-secondary cursor-pointer">
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            {status === 'connected' ? (
              <Wifi size={14} className="text-green" />
            ) : (
              <WifiOff size={14} className="text-text-muted" />
            )}
            <span className="text-xs text-text-muted hidden sm:inline">
              {status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting...' : 'Offline'}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary hidden sm:inline">
              {user?.username || 'User'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-text-muted hover:text-red transition-colors text-sm cursor-pointer"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
