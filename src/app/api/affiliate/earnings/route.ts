"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Database } from "@/types/supabase";

export async function GET() {
  try {
    const cookieStore = cookies();
    const supabase = await createClient(cookieStore);

    // Vérifier l'authentification
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    // Récupérer les gains d'affiliation de l'utilisateur
    const { data: earnings, error: earningsError } = await supabase
      .from('affiliate_earnings')
      .select(`
        amount,
        created_at,
        referred:referred_id (
          username,
          first_name,
          last_name
        )
      `)
      .eq('referrer_id', session.user.id as string)
      .order('created_at', { ascending: false });

    if (earningsError) {
      console.error('Erreur lors de la récupération des gains:', earningsError);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des gains" },
        { status: 500 }
      );
    }

    return NextResponse.json({ earnings });

  } catch (error) {
    console.error('Erreur inattendue:', error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
