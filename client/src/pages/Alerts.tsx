import { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCircle2, Filter, Plus } from 'lucide-react';
import { alertApi } from '../services/api';
import { Modal } from '../components/Modal';
import { toast } from '../components/Toast';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { Alert, ConfigureThresholdInput, ResourceType } from '../types';

const severityOrder: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const severityColor: Record<string, string> = {
  CRITICAL: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  HIGH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  MEDIUM: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  LOW: 'bg-white/5 text-slate-400 border-white/10',
};

export function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterResolved, setFilterResolved] = useState<string>('false');
  const [thresholdModal, setThresholdModal] = useState(false);
  const [form, setForm] = useState<ConfigureThresholdInput>({ counterId: '', threshold: 0, alertType: 'WATER' });
  const [saving, setSaving] = useState(false);

  const loadAlerts = useCallback(async () => {
    try {
      const res = await alertApi.getAll({ resolved: filterResolved || undefined });
      setAlerts([...res.data].sort((a, b) => (severityOrder[a.severity] ?? 99) - (severityOrder[b.severity] ?? 99)));
    } catch { /* ignore */ }
    setLoading(false);
  }, [filterResolved]);

  useEffect(() => { loadAlerts(); }, [loadAlerts]);

  const handleResolve = async (id: string) => {
    try { await alertApi.resolve(id); toast('success', 'Alerte résolue'); await loadAlerts(); }
    catch { toast('error', "Erreur lors de la résolution de l'alerte"); }
  };

  const handleThreshold = async () => {
    if (!form.counterId.trim() || form.threshold < 0) { toast('error', 'Veuillez remplir tous les champs.'); return; }
    setSaving(true);
    try { await alertApi.setThreshold(form); toast('success', 'Seuil configuré'); setThresholdModal(false); setForm({ counterId: '', threshold: 0, alertType: 'WATER' }); await loadAlerts(); }
    catch { toast('error', "Erreur lors de la configuration"); }
    setSaving(false);
  };

  if (loading) {
    return <div><h1 className="mb-8 text-2xl font-semibold text-slate-100">Alertes</h1><TableSkeleton rows={5} /></div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Alertes</h1>
          <p className="text-sm text-slate-400">{alerts.length} alerte(s)</p>
        </div>
        <button onClick={() => setThresholdModal(true)} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20">
          <Plus className="h-4 w-4" /> Configurer un seuil
        </button>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <Filter className="h-4 w-4 text-slate-400" />
        <select value={filterResolved} onChange={(e) => { setLoading(true); setFilterResolved(e.target.value); }}
          className="rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-slate-200 outline-none focus:border-cyan-500/50">
          <option value="false">Non résolues</option>
          <option value="true">Résolues</option>
          <option value="">Toutes</option>
        </select>
      </div>

      {alerts.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <EmptyState icon={Bell} title="Aucune alerte" description={filterResolved === 'false' ? 'Aucune alerte active.' : 'Aucune alerte trouvée.'} />
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map((a) => {
            const isCritical = a.severity === 'CRITICAL' || a.severity === 'HIGH';
            return (
              <div key={a.id} className={`flex items-start gap-4 rounded-2xl border ${isCritical ? 'border-rose-500/20 bg-rose-500/[0.03]' : 'border-white/10 bg-white/[0.04]'} p-5 transition-all hover:bg-white/[0.06] backdrop-blur-md`}>
                <div className={`mt-0.5 flex h-2 w-2 shrink-0 rounded-full ${isCritical ? 'bg-rose-500 shadow-lg shadow-rose-500/30 animate-pulse' : a.severity === 'MEDIUM' ? 'bg-amber-400' : 'bg-slate-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${severityColor[a.severity] ?? ''}`}>{a.severity}</span>
                    <span className="text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-sm text-slate-300">{a.message}</p>
                </div>
                {!a.isResolved && (
                  <button onClick={() => handleResolve(a.id)} className="flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-400 hover:bg-emerald-500/20 transition-colors border border-emerald-500/20">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Résoudre
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal open={thresholdModal} onClose={() => setThresholdModal(false)} title="Configurer un seuil d'alerte">
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">ID du compteur</label>
            <input type="text" value={form.counterId} onChange={(e) => setForm({ ...form, counterId: e.target.value })} placeholder="UUID du compteur"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Type</label>
            <select value={form.alertType} onChange={(e) => setForm({ ...form, alertType: e.target.value as ResourceType })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20">
              <option value="WATER">Eau</option><option value="ELECTRICITY">Électricité</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Seuil</label>
            <input type="number" step="0.01" min="0" value={form.threshold} onChange={(e) => setForm({ ...form, threshold: Number(e.target.value) })} placeholder="Ex: 100"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setThresholdModal(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">Annuler</button>
            <button onClick={handleThreshold} disabled={saving} className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 shadow-lg shadow-cyan-500/20">
              {saving ? 'Configuration...' : 'Configurer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
