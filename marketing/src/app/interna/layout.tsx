import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interna — Gota+Check",
  robots: { index: false, follow: false },
};

export default function InternaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbf6f4] text-[#2a2220]">
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
