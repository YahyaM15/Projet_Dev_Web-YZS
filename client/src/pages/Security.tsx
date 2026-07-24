import { useCallback, useEffect, useState } from 'react';
import { Shield, AlertTriangle, LogIn, UserPlus, CheckCircle2, Activity, XCircle } from 'lucide-react';
import { auditLogApi } from '../services/api';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { AuditLog } from '../types';

const actionMeta: Record<string, { label: string; icon: typeof Shield; color: string }> = {
  LOGIN_SUCCESS: { label: 'Connexion réussie', icon: LogIn, color: 'text-emerald-400 bg-emerald-500/10' },
  LOGIN_FAILED: { label: 'Tentative échouée', icon: XCircle, color: 'text-rose-400 bg-rose-500/10' },
  LOGOUT: { label: 'Déconnexion', icon: LogIn, color: 'text-slate-400 bg-white/5' },
  REGISTER: { label: 'Inscription', icon: UserPlus, color: 'text-cyan-400 bg-cyan-500/10' },
  RECORD_CREATED: { label: 'Relevé créé', icon: Activity, color: 'text-cyan-400 bg-cyan-500/10' },
  ANOMALY_DETECTED: { label: 'Anomalie détectée', icon: AlertTriangle, color: 'text-rose-400 bg-rose-500/10' },
  ALERT_RESOLVED: { label: 'Alerte résolue', icon: CheckCircle2, color: 'text-emerald-400 bg-emerald-500/10' },
  THRESHOLD_CONFIGURED: { label: 'Seuil configuré', icon: Shield, color: 'text-amber-400 bg-amber-500/10' },
  COUNTER_CREATED: { label: 'Compteur créé', icon: Shield, color: 'text-cyan-400 bg-cyan-500/10' },
  COUNTER_UPDATED: { label: 'Compteur modifié', icon: Shield, color: 'text-amber-400 bg-amber-500/10' },
  COUNTER_DELETED: { label: 'Compteur supprimé', icon: Shield, color: 'text-rose-400 bg-rose-500/10' },
};

export function Security() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      const res = await auditLogApi.getAll();
      setLogs(res.data);
    } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  const failedAttempts = logs.filter((l) => l.action === 'LOGIN_FAILED').length;
  const anomalies = logs.filter((l) => l.action === 'ANOMALY_DETECTED').length;

  if (loading) {
    return <div><h1 className="mb-8 text-2xl font-semibold text-slate-100">Sécurité & Audit</h1><TableSkeleton rows={8} /></div>;
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-slate-100">Sécurité & Audit</h1>
        <p className="text-sm text-slate-400">Journal des événements de sécurité</p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
          <span className="text-sm text-slate-400">Nombre total d'événements</span>
          <p className="mt-1 text-2xl font-semibold text-slate-100">{logs.length}</p>
        </div>
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] backdrop-blur-md p-5">
          <span className="text-sm text-rose-400">Tentatives échouées</span>
          <p className="mt-1 text-2xl font-semibold text-rose-400">{failedAttempts}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] backdrop-blur-md p-5">
          <span className="text-sm text-amber-400">Anomalies détectées</span>
          <p className="mt-1 text-2xl font-semibold text-amber-400">{anomalies}</p>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <EmptyState icon={Shield} title="Aucun événement" description="Le journal d'audit est vide." />
        </div>
      ) : (
        <div className="space-y-2">
          {logs.map((log) => {
            const meta = actionMeta[log.action] ?? { label: log.action, icon: Shield, color: 'text-slate-400 bg-white/5' };
            const Icon = meta.icon;
            const isFailed = log.action === 'LOGIN_FAILED';
            return (
              <div key={log.id} className={`flex items-start gap-4 rounded-2xl border ${isFailed ? 'border-rose-500/20 bg-rose-500/[0.03]' : 'border-white/10 bg-white/[0.04]'} p-4 backdrop-blur-md transition-all hover:bg-white/[0.06]`}>
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${meta.color}`}><Icon className="h-4.5 w-4.5" /></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-medium text-slate-200">{meta.label}</span>
                    <span className="text-xs text-slate-500 font-mono">{log.ipAddress}</span>
                  </div>
                  {log.details && <p className="text-xs text-slate-400">{log.details}</p>}
                  {log.email && <p className="text-xs text-slate-500">{log.email}</p>}
                </div>
                <span className="text-xs text-slate-500 shrink-0 font-mono">
                  {new Date(log.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
