"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { ReactNode, useEffect, useState } from "react";

export default function ClientLayout({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <AuthProvider>
      {isMounted ? children : (
        <div className="fixed inset-0 bg-zinc-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      )}
    </AuthProvider>
  );
}
