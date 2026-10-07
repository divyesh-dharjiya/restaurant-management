import { privatePage } from "@/lib/seo";
import { DashboardView } from "@/features/dashboard/DashboardView";

export const metadata = privatePage("Dashboard");

export default function DashboardPage() {
  return <DashboardView />;
}
