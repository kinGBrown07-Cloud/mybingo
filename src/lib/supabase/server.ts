import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { Database } from "@/types/supabase";

export async function createClient(cookieStore: ReturnType<typeof cookies>) {
  const cookieData = await cookieStore;

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieData.get(name)?.value;
        },
        set(name: string, value: string, options: { path: string; maxAge: number }) {
          cookieData.set(name, value, options);
        },
        remove(name: string, options: { path: string }) {
          cookieData.set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );
}
