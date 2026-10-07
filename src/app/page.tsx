import { privatePage } from "@/lib/seo";
import { FloorView } from "@/features/floor/FloorView";

export const metadata = privatePage("Floor");

export default function FloorPage() {
  return <FloorView />;
}
