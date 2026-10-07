import Link from "next/link";
import { SearchX } from "lucide-react";
import { EmptyState } from "@/components/ui";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <EmptyState icon={SearchX} title="We couldn’t find that page">
      <span className="mt-3 flex justify-center gap-2">
        <Link href="/" className="btn btn-primary">Go to floor</Link>
        <Link href="/menu" className="btn btn-ghost">View menu</Link>
      </span>
    </EmptyState>
  );
}
