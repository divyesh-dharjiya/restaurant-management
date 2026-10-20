import { privatePage } from "@/lib/seo";
import { seedTables } from "@/lib/catalog";
import { OrderView } from "@/features/pos/OrderView";

/** Pre-build the default tables so they open instantly; tables added later still render on demand. */
export const generateStaticParams = () => seedTables.map((t) => ({ id: t.id }));

export const metadata = privatePage("Take order");

export default async function TablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderView id={decodeURIComponent(id)} />;
}
