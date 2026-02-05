import type { ReactNode } from "react";
import StoreNavbar from "@/components/store/StoreNavbar";

export default function StoreLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <StoreNavbar />
      <div>{children}</div>
    </>
  );
}
