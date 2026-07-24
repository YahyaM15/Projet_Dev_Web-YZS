import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';

interface ChartDataPoint {
  day: string;
  actuel: number;
  prevu: number;
}

interface PredictionChartProps {
  data: ChartDataPoint[];
}

export function PredictionChart({ data }: PredictionChartProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-100">Prévision de consommation mensuelle</h3>
      {data.length === 0 ? (
        <div className="flex h-48 items-center justify-center text-sm text-slate-500">Aucune donnée disponible</div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', color: '#f1f5f9' }} cursor={{ stroke: 'rgba(255,255,255,0.1)' }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
            <Line type="monotone" dataKey="actuel" stroke="#22d3ee" strokeWidth={2} dot={false} name="Actuel" />
            <Line type="monotone" dataKey="prevu" stroke="#fbbf24" strokeWidth={2} strokeDasharray="5 5" dot={false} name="Prévu" />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function EstimatedBill({ total, type }: { total: number; type: 'WATER' | 'ELECTRICITY' }) {
  const rate = type === 'WATER' ? 0.045 : 0.18;
  const estimated = total * rate;
  const projection = estimated * 1.15;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md p-5">
      <h3 className="mb-4 text-sm font-semibold text-slate-100">Facture estimée</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Type</span>
          <span className="text-sm font-medium text-slate-200">{type === 'WATER' ? 'Eau' : 'Électricité'}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Consommation</span>
          <span className="text-sm font-mono text-slate-200">{total.toFixed(1)} {type === 'WATER' ? 'L' : 'Wh'}</span>
        </div>
        <div className="border-t border-white/5 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Taxe ({rate} /unité)</span>
            <span className="text-sm font-mono text-slate-200">{estimated.toFixed(2)} DH</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Projection fin de mois</span>
          <span className="text-base font-semibold text-amber-400">{projection.toFixed(2)} DH</span>
        </div>
      </div>
    </div>
  );
}
