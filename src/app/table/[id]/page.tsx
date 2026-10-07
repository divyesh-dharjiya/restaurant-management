import { privatePage } from "@/lib/seo";
import { OrderView } from "@/features/pos/OrderView";

export const metadata = privatePage("Take order");

export default async function TablePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OrderView id={decodeURIComponent(id)} />;
}
