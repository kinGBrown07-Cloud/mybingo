"use client";

import { ReactNode } from "react";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function RootWrapper({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={inter.className} suppressHydrationWarning>
      <body suppressHydrationWarning className="min-h-screen bg-background font-sans antialiased">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
