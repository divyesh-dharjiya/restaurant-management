/** Shown instantly while the bill screen loads. */
export default function Loading() {
  return (
    <div className="mx-auto grid max-w-5xl items-start gap-6 lg:grid-cols-[1fr_360px]" aria-busy="true" aria-label="Loading bill">
      <div className="skeleton order-last h-[32rem] rounded-3xl lg:order-none" />
      <div className="skeleton h-80 rounded-2xl" />
    </div>
  );
}
