import { useEffect, useState } from 'react';
import { Map, Droplets, Zap, AlertTriangle } from 'lucide-react';
import { resourceApi, alertApi } from '../services/api';
import { CardSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { Meter, Alert } from '../types';

export function MapPage() {
  const [meters, setMeters] = useState<Meter[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [mRes, aRes] = await Promise.all([resourceApi.getAll(), alertApi.getAll({ resolved: 'false' })]);
        setMeters(mRes.data);
        setAlerts(aRes.data.filter((a) => !a.isResolved));
      } catch { /* ignore */ }
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return <div><h1 className="mb-8 text-2xl font-semibold text-slate-100">Carte interactive</h1><div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}</div></div>;
  }

  const metersWithCoords = meters.filter((m) => m.latitude && m.longitude);
  const minLat = metersWithCoords.length > 0 ? Math.min(...metersWithCoords.map((m) => m.latitude!)) - 0.02 : 0;
  const maxLat = metersWithCoords.length > 0 ? Math.max(...metersWithCoords.map((m) => m.latitude!)) + 0.02 : 0;
  const minLng = metersWithCoords.length > 0 ? Math.min(...metersWithCoords.map((m) => m.longitude!)) - 0.02 : 0;
  const maxLng = metersWithCoords.length > 0 ? Math.max(...metersWithCoords.map((m) => m.longitude!)) + 0.02 : 0;

  const toX = (lng: number) => ((lng - minLng) / (maxLng - minLng || 1)) * 100;
  const toY = (lat: number) => ((maxLat - lat) / (maxLat - minLat || 1)) * 100;

  const activeAlertMeterIds = new Set(alerts.map((a) => a.meterId));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">Carte interactive</h1>
        <p className="text-sm text-slate-400">{meters.length} compteurs · {alerts.length} alerte(s) active(s)</p>
      </div>

      {metersWithCoords.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <EmptyState icon={Map} title="Aucune donnée de localisation" description="Les compteurs n'ont pas de coordonnées GPS. Lancez le seed pour en générer." />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative h-[500px] rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden backdrop-blur-md">
              <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
              {metersWithCoords.map((m) => {
                const hasAlert = activeAlertMeterIds.has(m.id);
                const isWater = m.type === 'WATER';
                return (
                  <button key={m.id} onClick={() => setSelectedMeter(m)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-200 hover:scale-125 ${selectedMeter?.id === m.id ? 'z-10 scale-125' : 'z-0'}`}
                    style={{ left: `${toX(m.longitude!)}%`, top: `${toY(m.latitude!)}%` }}>
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl border-2 backdrop-blur-md transition-all ${
                      isWater ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-400' : 'bg-amber-500/20 border-amber-400/50 text-amber-400'
                    } ${hasAlert ? 'animate-pulse shadow-lg shadow-rose-500/30 border-rose-500' : ''}`}>
                      {isWater ? <Droplets className="h-5 w-5" /> : <Zap className="h-5 w-5" />}
                    </div>
                    {hasAlert && <div className="absolute -top-1 -right-1"><AlertTriangle className="h-4 w-4 text-rose-400" /></div>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            {selectedMeter ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
                <h3 className="text-sm font-semibold text-slate-100 mb-3">Détails du compteur</h3>
                <div className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-slate-400">N° Série</span><span className="text-xs font-mono text-slate-200">{selectedMeter.serialNumber}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Type</span><span className="text-xs text-slate-200">{selectedMeter.type === 'WATER' ? 'Eau' : 'Électricité'}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Adresse</span><span className="text-xs text-slate-200 text-right max-w-[180px]">{selectedMeter.location}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-slate-400">Coordonnées</span><span className="text-xs font-mono text-slate-200">{selectedMeter.latitude?.toFixed(4)}, {selectedMeter.longitude?.toFixed(4)}</span></div>
                  {activeAlertMeterIds.has(selectedMeter.id) && (
                    <div className="flex items-center gap-2 rounded-xl bg-rose-500/10 px-3 py-2 text-xs text-rose-400"><AlertTriangle className="h-3.5 w-3.5" /> Alerte active</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
                <p className="text-sm text-slate-400">Cliquez sur un compteur sur la carte pour voir ses détails.</p>
              </div>
            )}

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
              <h3 className="text-sm font-semibold text-slate-100 mb-3">Légende</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-cyan-400/50" /><span className="text-xs text-slate-400">Compteur eau</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-amber-400/50" /><span className="text-xs text-slate-400">Compteur électricité</span></div>
                <div className="flex items-center gap-2"><div className="h-3 w-3 rounded bg-rose-500 animate-pulse" /><span className="text-xs text-slate-400">Alerte active</span></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
