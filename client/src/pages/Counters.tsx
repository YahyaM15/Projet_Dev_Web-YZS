import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Droplets, Zap, Gauge, Pencil, Trash2 } from 'lucide-react';
import { resourceApi } from '../services/api';
import { Modal } from '../components/Modal';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { toast } from '../components/Toast';
import { TableSkeleton } from '../components/Skeleton';
import { EmptyState } from '../components/EmptyState';
import type { ApiError, Meter, ResourceType } from '../types';
import { AxiosError } from 'axios';

const resourceTypeLabel: Record<string, string> = { WATER: 'Eau', ELECTRICITY: 'Électricité' };
const resourceTypeIcon: Record<string, typeof Droplets> = { WATER: Droplets, ELECTRICITY: Zap };
const resourceTypeColor: Record<string, string> = { WATER: 'bg-cyan-500/10 text-cyan-400', ELECTRICITY: 'bg-amber-500/10 text-amber-400' };

interface CounterForm { type: ResourceType; counterNumber: string; address: string }
const emptyForm: CounterForm = { type: 'WATER', counterNumber: '', address: '' };

export function Counters() {
  const navigate = useNavigate();
  const [counters, setCounters] = useState<Meter[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<CounterForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const loadCounters = useCallback(async () => {
    try { const res = await resourceApi.getAll(); setCounters(res.data); } catch { /* ignore */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadCounters(); }, [loadCounters]);

  const filtered = counters.filter((c) => c.serialNumber.toLowerCase().includes(search.toLowerCase()) || c.location.toLowerCase().includes(search.toLowerCase()));

  const openCreate = () => { setForm(emptyForm); setEditing(null); setModalOpen(true); };
  const openEdit = (c: Meter) => { setForm({ type: c.type, counterNumber: c.serialNumber, address: c.location }); setEditing(c.id); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.counterNumber.trim() || !form.address.trim()) { toast('error', 'Veuillez remplir tous les champs.'); return; }
    setSaving(true);
    try {
      if (editing) {
        await resourceApi.update(editing, {
          ...(form.type ? { type: form.type } : {}),
          ...(form.counterNumber ? { counterNumber: form.counterNumber } : {}),
          ...(form.address ? { address: form.address } : {}),
        });
        toast('success', 'Compteur mis à jour et repositionné');
      } else {
        await resourceApi.create(form);
        toast('success', 'Compteur créé, géolocalisé et suivi automatiquement');
      }
      setModalOpen(false);
      await loadCounters();
    } catch (err) {
      const apiMessage = err instanceof AxiosError
        ? (err.response?.data as ApiError | undefined)?.message
        : undefined;
      toast('error', apiMessage ?? 'Erreur inattendue lors de la sauvegarde');
    }
    setSaving(false);
  };

  const confirmDelete = (id: string) => { setConfirmId(id); setConfirmOpen(true); };
  const handleDelete = async () => {
    if (!confirmId) return;
    setDeleting(confirmId);
    try { await resourceApi.update(confirmId, { counterNumber: '__deleted__' }); toast('success', 'Compteur supprimé'); setConfirmOpen(false); setConfirmId(null); await loadCounters(); }
    catch { toast('error', 'Erreur lors de la suppression'); }
    setDeleting(null);
  };

  if (loading) {
    return <div><h1 className="mb-8 text-2xl font-semibold text-slate-100">Compteurs</h1><TableSkeleton rows={6} /></div>;
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Compteurs</h1>
          <p className="text-sm text-slate-400">{counters.length} compteur(s) enregistré(s)</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors shadow-lg shadow-cyan-500/20">
          <Plus className="h-4 w-4" /> Nouveau compteur
        </button>
      </div>

      {counters.length > 0 && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher par numéro de série ou adresse..." className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none" />
        </div>
      )}

      {counters.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <EmptyState icon={Gauge} title="Aucun compteur" description="Créez votre premier compteur pour commencer à suivre votre consommation." action={{ label: 'Créer un compteur', onClick: openCreate }} />
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Type</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">N° Série</th>
                <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">Adresse</th>
                <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((c) => {
                const Icon = resourceTypeIcon[c.type] ?? Zap;
                return (
                  <tr key={c.id} className="group cursor-pointer transition-colors hover:bg-white/[0.02]" onClick={() => navigate(`/counters/${c.id}`)}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${resourceTypeColor[c.type] ?? ''}`}><Icon className="h-4 w-4" /></div>
                        <span className="text-sm font-medium text-slate-300">{resourceTypeLabel[c.type] ?? c.type}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm font-mono text-slate-200">{c.serialNumber}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{c.location}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <button onClick={(e) => { e.stopPropagation(); openEdit(c); }} className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-colors"><Pencil className="h-4 w-4" /></button>
                        <button onClick={(e) => { e.stopPropagation(); confirmDelete(c.id); }} className="rounded-lg p-2 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Modifier le compteur' : 'Nouveau compteur'}>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Type</label>
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as ResourceType })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20">
              <option value="WATER">Eau</option><option value="ELECTRICITY">Électricité</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Numéro de série</label>
            <input type="text" value={form.counterNumber} onChange={(e) => setForm({ ...form, counterNumber: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Adresse</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Ex. Fès, Rue 8"
              className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20"
            />
            <p className="mt-1.5 text-xs text-slate-500">
              La position GPS est calculée automatiquement à partir de l’adresse.
            </p>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => setModalOpen(false)} className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 hover:bg-white/5 transition-colors">Annuler</button>
            <button onClick={handleSave} disabled={saving} className="rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 shadow-lg shadow-cyan-500/20">
              {saving ? (editing ? 'Repositionnement...' : 'Géolocalisation...') : editing ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog open={confirmOpen} onConfirm={handleDelete} onCancel={() => { setConfirmOpen(false); setConfirmId(null); }} title="Supprimer le compteur" message="Êtes-vous sûr de vouloir supprimer ce compteur ? Cette action est irréversible." loading={deleting !== null} />
    </div>
  );
}
