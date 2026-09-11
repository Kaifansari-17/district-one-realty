export function SkeletonCard() {
  return (
    <div className="animate-pulse overflow-hidden rounded-xl border border-border bg-white">
      <div className="aspect-[4/3] bg-grey-light" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-2/3 rounded bg-grey-light" />
        <div className="h-3 w-1/2 rounded bg-grey-light" />
        <div className="h-4 w-1/3 rounded bg-grey-light" />
      </div>
    </div>
  );
}

export function SkeletonRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
