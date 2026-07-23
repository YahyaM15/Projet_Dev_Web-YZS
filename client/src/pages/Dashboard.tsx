import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, Bell, Droplets, Zap, TrendingUp, Plus, ArrowRight } from 'lucide-react';
import { resourceApi, alertApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { StatCard } from '../components/StatCard';
import { CardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import { PredictionChart, EstimatedBill } from '../components/charts/PredictionChart';
import type { Meter, Alert, ConsumptionStats } from '../types';

function generatePredictionData(statsMap: Record<string, ConsumptionStats>): Array<{ day: string; actuel: number; prevu: number }> {
  const total = Object.values(statsMap).reduce((s, st) => s + st.total, 0);
  if (total === 0) return [];
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  return days.map((d, i) => ({
    day: d,
    actuel: Math.round((total / 30) * (i + 1) * 100) / 100,
    prevu: Math.round((total / 30) * (i + 1) * 1.18 * 100) / 100,
  }));
}

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counters, setCounters] = useState<Meter[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<Record<string, ConsumptionStats>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [countersRes, alertsRes] = await Promise.all([resourceApi.getAll(), alertApi.getAll({ resolved: 'false' })]);
        setCounters(countersRes.data);
        setAlerts(alertsRes.data);
        const statsMap: Record<string, ConsumptionStats> = {};
        await Promise.all(countersRes.data.map(async (c) => {
          try { const s = await resourceApi.getStats(c.id); statsMap[c.id] = s.data; } catch { /* ignore */ }
        }));
        setStats(statsMap);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  const totalConsumption = Object.values(stats).reduce((sum, s) => sum + s.total, 0);
  const waterCounters = counters.filter((c) => c.type === 'WATER').length;
  const electricCounters = counters.filter((c) => c.type === 'ELECTRICITY').length;
  const unresolvedAlerts = alerts.filter((a) => !a.isResolved).length;
  const chartData = generatePredictionData(stats);
  const hasWater = counters.some((c) => c.type === 'WATER');
  const hasElec = counters.some((c) => c.type === 'ELECTRICITY');

  if (loading) {
    return (
      <div>
        <h1 className="mb-8 text-2xl font-semibold text-slate-100">Dashboard</h1>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Dashboard</h1>
          <p className="text-sm text-slate-400">Bienvenue, {user?.name ?? 'Utilisateur'}</p>
        </div>
        <button onClick={() => navigate('/counters')} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20">
          <Plus className="h-4 w-4" /> Nouveau compteur
        </button>
      </div>

      <div className="mb-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Gauge} label="Compteurs" value={counters.length} sublabel={`${waterCounters} eau · ${electricCounters} électricité`} />
        <StatCard icon={Droplets} label="Consommation totale" value={totalConsumption.toFixed(1)} sublabel="Tous compteurs confondus" accent="cyan" />
        <StatCard icon={TrendingUp} label="Moyenne par compteur" value={counters.length > 0 ? (totalConsumption / counters.length).toFixed(1) : '—'} sublabel="Consommation moyenne" accent="amber" />
        <StatCard icon={Bell} label="Alertes actives" value={unresolvedAlerts} sublabel={`${alerts.length} totale(s)`} accent="rose" />
      </div>

      <div className="mb-8 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2"><PredictionChart data={chartData} /></div>
        <div className="space-y-4">
          {hasWater && <EstimatedBill total={totalConsumption / 2} type="WATER" />}
          {hasElec && <EstimatedBill total={totalConsumption / 2} type="ELECTRICITY" />}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-100">Derniers compteurs</h2>
            <button onClick={() => navigate('/counters')} className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300">Voir tout <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>
          {counters.length === 0 ? (
            <div className="px-5 py-8"><EmptyState icon={Gauge} title="Aucun compteur" description="Ajoutez votre premier compteur pour commencer le suivi." action={{ label: 'Ajouter un compteur', onClick: () => navigate('/counters') }} /></div>
          ) : (
            <ul className="divide-y divide-white/5">
              {counters.slice(0, 5).map((c) => {
                const Icon = c.type === 'WATER' ? Droplets : Zap;
                return (
                  <li key={c.id} className="flex items-center gap-3 px-5 py-3.5">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${c.type === 'WATER' ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}><Icon className="h-4 w-4" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{c.serialNumber}</p>
                      <p className="text-xs text-slate-500 truncate">{c.location}</p>
                    </div>
                    <span className="text-xs text-slate-500">{stats[c.id]?.count ?? 0} relevés</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-100">Alertes récentes</h2>
            <button onClick={() => navigate('/alerts')} className="flex items-center gap-1 text-xs font-medium text-cyan-400 hover:text-cyan-300">Voir tout <ArrowRight className="h-3.5 w-3.5" /></button>
          </div>
          {alerts.length === 0 ? (
            <div className="px-5 py-8"><EmptyState icon={Bell} title="Aucune alerte" description="Tout est sous contrôle." /></div>
          ) : (
            <ul className="divide-y divide-white/5">
              {alerts.slice(0, 5).map((a) => (
                <li key={a.id} className="flex items-center gap-3 px-5 py-3.5">
                  <div className={`flex h-2 w-2 rounded-full ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'bg-rose-500 shadow-lg shadow-rose-500/30' : a.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                  <p className="flex-1 text-sm text-slate-300 truncate">{a.message}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${a.severity === 'CRITICAL' || a.severity === 'HIGH' ? 'bg-rose-500/10 text-rose-400' : a.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' : 'bg-white/5 text-slate-400'}`}>{a.severity}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
