import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { esFront } from "@/lib/superficie";

/** El panel nunca debe indexarse ni aparecer en el sitemap. */
export const metadata: Metadata = {
  title: "Panel",
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  /* En el despliegue público el panel no existe. Un 404 y no un 403:
     un 403 confirma que ahí hay algo. */
  if (esFront) notFound();

  return children;
}
