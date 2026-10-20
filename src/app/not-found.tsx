import Link from "next/link";
import { SearchX } from "lucide-react";
import { routes } from "@/config/site";
import { Logo } from "@/components/layout/Logo";
import { EmptyState } from "@/components/ui/EmptyState";

export const metadata = { title: "Page not found", robots: { index: false } };

export default function NotFound() {
  return (
    <main id="main" className="mx-auto max-w-xl space-y-8 px-4 py-10">
      <Logo href={routes.home} />
      <EmptyState icon={SearchX} title="We couldn’t find that page">
        <span className="mt-3 flex justify-center gap-2">
          <Link href={routes.home} className="btn btn-primary">Home</Link>
          <Link href={routes.menu} className="btn btn-ghost">View menu</Link>
        </span>
      </EmptyState>
    </main>
  );
}
