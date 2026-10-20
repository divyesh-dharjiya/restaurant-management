/** Shown instantly while a table's order screen loads, so taps never feel frozen. */
export default function Loading() {
  return (
    <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_400px] xl:gap-6" aria-busy="true" aria-label="Loading order screen">
      <div className="min-w-0 space-y-4">
        <div className="flex items-center gap-3">
          <div className="skeleton size-10 rounded-xl" />
          <div className="space-y-2">
            <div className="skeleton h-6 w-32" />
            <div className="skeleton h-3 w-24" />
          </div>
        </div>
        <div className="skeleton h-11 rounded-xl" />
        <div className="flex gap-2 overflow-hidden">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton h-9 w-28 shrink-0 rounded-full" />)}
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => <div key={i} className="skeleton aspect-[4/5] rounded-2xl" />)}
        </div>
      </div>
      <div className="skeleton hidden h-[calc(100dvh-6rem)] rounded-2xl xl:block" />
    </div>
  );
}
