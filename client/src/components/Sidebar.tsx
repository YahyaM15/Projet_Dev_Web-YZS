import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Gauge, Bell, Map, Shield } from 'lucide-react';

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/counters', icon: Gauge, label: 'Compteurs' },
  { to: '/alerts', icon: Bell, label: 'Alertes' },
  { to: '/map', icon: Map, label: 'Carte' },
  { to: '/security', icon: Shield, label: 'Sécurité' },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-white/10 bg-white/[0.03] backdrop-blur-xl">
      <div className="flex items-center gap-2.5 border-b border-white/5 px-6 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-500/20">
          <Gauge className="h-4.5 w-4.5 text-cyan-400" />
        </div>
        <span className="text-sm font-semibold text-slate-100">Smart Resource</span>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                isActive ? 'bg-cyan-500/10 text-cyan-400' : 'text-slate-400 hover:bg-white/[0.04] hover:text-slate-200'
              }`
            }
          >
            <Icon className="h-4.5 w-4.5" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
