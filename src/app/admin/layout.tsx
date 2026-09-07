import type { Metadata } from "next";

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
  return children;
}
