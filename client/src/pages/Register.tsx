import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gauge, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AxiosError } from 'axios';

export function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPwd, setShowPwd] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', fullName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (!form.email.trim() || !form.password || !form.fullName.trim()) { setError('Veuillez remplir tous les champs.'); return; }
    setLoading(true);
    try {
      await register(form);
      navigate('/login', { replace: true });
    } catch (err) {
      if (err instanceof AxiosError && err.response?.data) {
        const data = err.response.data as any;
        if (data.errors?.length) setError(data.errors.map((e: any) => e.message).join('\n'));
        else setError(data.message || 'Erreur lors de l\'inscription.');
      } else setError('Erreur lors de l\'inscription.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl backdrop-blur-2xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10">
            <Gauge className="h-7 w-7 text-cyan-400" />
          </div>
          <h1 className="text-xl font-semibold text-slate-100">Inscription</h1>
          <p className="mt-1 text-sm text-slate-500">Créez votre compte</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Nom complet</label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} placeholder="Jean Dupont"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Email</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@exemple.com"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20" />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-300">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] py-2.5 pl-10 pr-10 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500/50 focus:bg-white/[0.08] focus:ring-2 focus:ring-cyan-500/20" />
              <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          {error && <p className="text-xs text-rose-400 whitespace-pre-line">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-xl bg-cyan-600 py-2.5 text-sm font-medium text-white hover:bg-cyan-500 transition-colors disabled:opacity-50 shadow-lg shadow-cyan-500/20">
            {loading ? 'Inscription...' : 'Créer un compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Déjà un compte ? <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
