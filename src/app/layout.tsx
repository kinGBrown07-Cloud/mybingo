import type { Metadata } from "next";
import "./globals.css";
import ClientLayout from "@/components/layouts/client-layout";
import RootWrapper from "@/components/layouts/root-wrapper";
import { Navbar } from "@/components/navigation/navbar";

export const metadata: Metadata = {
  title: "Bingoo - Jeux de cartes en ligne",
  description: "Jouez à des jeux de cartes passionnants et gagnez des lots exceptionnels",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RootWrapper>
      <ClientLayout>
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
        </div>
      </ClientLayout>
    </RootWrapper>
  );
}
