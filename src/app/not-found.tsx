import Link from "next/link";
import { SearchX } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl space-y-8 px-4 py-10">
      <Logo href="/menu" />
      <EmptyState icon={SearchX} title="We couldn’t find that page">
        <span className="mt-3 flex justify-center gap-2">
          <Link href="/menu" className="btn btn-primary">View menu</Link>
          <Link href="/" className="btn btn-ghost">Staff floor</Link>
        </span>
      </EmptyState>
    </main>
  );
}
