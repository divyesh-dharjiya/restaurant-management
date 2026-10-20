import { privatePage } from "@/lib/seo";
import { seedTables } from "@/lib/catalog";
import { BillView } from "@/features/pos/BillView";

/** Pre-build the default tables so they open instantly; tables added later still render on demand. */
export const generateStaticParams = () => seedTables.map((t) => ({ id: t.id }));

export const metadata = privatePage("Bill");

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillView id={decodeURIComponent(id)} />;
}
