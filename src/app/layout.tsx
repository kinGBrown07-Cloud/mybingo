import { Inter } from "next/font/google";
import "./globals.css";
import ClientLayout from "@/components/layouts/client-layout";
import { Navbar } from "@/components/navigation/navbar";
import { AuthProviderWrapper } from '@/components/providers/auth-provider-wrapper';

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: 'Bingoo - Jeux en ligne',
  description: 'Plateforme de jeux en ligne Bingoo',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={inter.className} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <AuthProviderWrapper>
          <ClientLayout>
            <div className="relative flex min-h-screen flex-col">
              <Navbar />
              <main className="flex-1">
                {children}
              </main>
            </div>
          </ClientLayout>
        </AuthProviderWrapper>
      </body>
    </html>
  );
}
