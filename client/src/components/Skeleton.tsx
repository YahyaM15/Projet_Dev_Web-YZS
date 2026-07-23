export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
      <div className="mb-3 h-3 w-20 rounded bg-white/5" />
      <div className="h-7 w-32 rounded bg-white/5" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
          <div className="h-8 w-8 rounded-lg bg-white/5" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-1/3 rounded bg-white/5" />
            <div className="h-2 w-1/4 rounded bg-white/5" />
          </div>
        </div>
      ))}
    </div>
  );
}
