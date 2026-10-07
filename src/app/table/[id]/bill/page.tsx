import { privatePage } from "@/lib/seo";
import { BillView } from "@/features/pos/BillView";

export const metadata = privatePage("Bill");

export default async function BillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BillView id={decodeURIComponent(id)} />;
}
