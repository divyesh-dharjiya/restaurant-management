import StoreProvider from "@/store/StoreProvider";
import { Navbar } from "@/components/layout/Navbar";
import { StorageBanner } from "@/components/layout/StorageBanner";

/** Staff app: store, staff navigation and storage warnings. */
export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Navbar />
      <StorageBanner />
      <main id="main" className="mx-auto w-full max-w-[1600px] px-4 pb-24 pt-5 sm:px-6">{children}</main>
    </StoreProvider>
  );
}
