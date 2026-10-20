import { privatePage } from "@/lib/seo";
import { MenuManagerView } from "@/features/menu-manager/MenuManagerView";

export const metadata = privatePage("Menu availability");

export default function MenuManagerPage() {
  return <MenuManagerView />;
}
