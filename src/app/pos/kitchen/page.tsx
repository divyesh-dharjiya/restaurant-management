import { privatePage } from "@/lib/seo";
import { KitchenView } from "@/features/kitchen/KitchenView";

export const metadata = privatePage("Kitchen");

export default function KitchenPage() {
  return <KitchenView />;
}
