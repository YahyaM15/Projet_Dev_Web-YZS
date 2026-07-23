import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Droplets, Zap } from 'lucide-react';
import { resourceApi } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { EstimatedBill } from '../components/charts/PredictionChart';
import type { Meter, ConsumptionStats } from '../types';

export function CounterDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [counter, setCounter] = useState<Meter | null>(null);
  const [stats, setStats] = useState<ConsumptionStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        const [cRes, sRes] = await Promise.all([resourceApi.getById(id), resourceApi.getStats(id)]);
        setCounter(cRes.data);
        setStats(sRes.data);
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return <div><CardSkeleton /></div>;
  }

  if (!counter) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-8 text-center">
        <p className="text-slate-400">Compteur introuvable.</p>
        <button onClick={() => navigate('/counters')} className="mt-4 text-sm text-cyan-400 hover:text-cyan-300">Retour aux compteurs</button>
      </div>
    );
  }

  const isWater = counter.type === 'WATER';
  const Icon = isWater ? Droplets : Zap;

  return (
    <div>
      <button onClick={() => navigate('/counters')} className="mb-6 flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Retour aux compteurs
      </button>

      <div className="mb-8 flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${isWater ? 'bg-cyan-500/10 text-cyan-400' : 'bg-amber-500/10 text-amber-400'}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">{counter.serialNumber}</h1>
          <p className="text-sm text-slate-400">{counter.location}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
            <h3 className="mb-4 text-sm font-semibold text-slate-100">Informations</h3>
            <div className="space-y-3">
              <div className="flex justify-between"><span className="text-sm text-slate-400">Type</span><span className="text-sm text-slate-200">{isWater ? 'Eau' : 'Électricité'}</span></div>
              <div className="flex justify-between"><span className="text-sm text-slate-400">Adresse</span><span className="text-sm text-slate-200">{counter.location}</span></div>
              {counter.latitude && counter.longitude && (
                <div className="flex justify-between"><span className="text-sm text-slate-400">Coordonnées</span><span className="text-sm font-mono text-slate-200">{counter.latitude.toFixed(4)}, {counter.longitude.toFixed(4)}</span></div>
              )}
            </div>
          </div>

          {stats && (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
              <h3 className="mb-4 text-sm font-semibold text-slate-100">Statistiques de consommation</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="text-lg font-semibold text-slate-100">{stats.total.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Moyenne</p>
                  <p className="text-lg font-semibold text-slate-100">{stats.average?.toFixed(1) ?? '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Relevés</p>
                  <p className="text-lg font-semibold text-slate-100">{stats.count}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {stats && <EstimatedBill total={stats.total} type={counter.type} />}
      </div>
    </div>
  );
}
