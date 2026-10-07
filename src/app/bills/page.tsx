import { Suspense } from "react";
import { privatePage } from "@/lib/seo";
import { BillsView } from "@/features/bills/BillsView";

export const metadata = privatePage("Bills");

export default function BillsPage() {
  return (
    <Suspense>
      <BillsView />
    </Suspense>
  );
}
