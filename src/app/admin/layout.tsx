"use client";

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session?.user || session.user.role !== "ADMIN") {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  if (status === "loading") {
    return <div>Chargement...</div>;
  }

  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
