import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  LineChart,
  List,
  TrendingUp,
  Settings,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/overview', icon: LayoutDashboard, label: 'Overview' },
  { to: '/positions', icon: LineChart, label: 'Live Positions' },
  { to: '/trades', icon: List, label: 'Trade History' },
  { to: '/performance', icon: TrendingUp, label: 'Performance' },
  { to: '/settings', icon: Settings, label: 'Settings' },
  { to: '/wallet', icon: Wallet, label: 'Wallet' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-border bg-surface/50 backdrop-blur-xl transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-56'
      }`}
    >
      <div className={`flex items-center h-16 px-4 border-b border-border ${collapsed ? 'justify-center' : 'gap-3'}`}>
        <div className="w-8 h-8 rounded-lg bg-green/15 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={18} className="text-green" />
        </div>
        {!collapsed && <span className="text-lg font-bold tracking-wider text-green">ALPHA</span>}
      </div>

      <nav className="flex-1 py-4 flex flex-col gap-1 px-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-green/10 text-green border border-green/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-border text-text-muted hover:text-text-primary transition-colors cursor-pointer"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  );
}

export { navItems };
