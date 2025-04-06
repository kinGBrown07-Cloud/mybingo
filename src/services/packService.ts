"use server";

import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { Region, calculatePrice } from "./regionService";
import { Database } from "@/types/supabase";
import { PostgrestError } from "@supabase/supabase-js";

type Tables = Database["public"]["Tables"];
type TransactionInsert = Tables["transactions"]["Insert"];
type TransactionRow = Tables["transactions"]["Row"];

export type PackType = {
  id: string;
  name: string;
  points: number;
  type: "basic" | "plus" | "premium";
};

const PACKS: PackType[] = [
  {
    id: "pack_basic",
    name: "Pack Basic",
    points: 1000,
    type: "basic"
  },
  {
    id: "pack_plus",
    name: "Pack Plus",
    points: 2500,
    type: "plus"
  },
  {
    id: "pack_premium",
    name: "Pack Premium",
    points: 5000,
    type: "premium"
  }
];

export async function getPack(packId: string): Promise<PackType | null> {
  return PACKS.find(pack => pack.id === packId) || null;
}

export async function getPackPrice(packId: string, region: Region): Promise<number> {
  const pack = await getPack(packId);
  if (!pack) throw new Error("Pack invalide");
  return calculatePrice(pack.points, region);
}

export async function processPurchase(packId: string, paymentId: string, region: Region): Promise<{ success: boolean; transaction: TransactionRow }> {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const pack = await getPack(packId);
  
  if (!pack) {
    throw new Error("Pack invalide");
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error("Utilisateur non connecté");
  }

  const price = await getPackPrice(packId, region);

  // Créer la transaction
  const { data: transaction, error: transactionError } = await supabase
    .from("transactions")
    .insert({
      user_id: user.id,
      amount: price,
      type: "DEPOSIT",
      status: "COMPLETED",
      payment_id: paymentId,
      metadata: {
        pack_id: pack.id,
        points: pack.points,
        region: region
      }
    })
    .select()
    .single();

  if (transactionError || !transaction) {
    throw new Error("Erreur lors de la création de la transaction");
  }

  // Mettre à jour le solde en points
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      points: supabase.sql`points + ${pack.points}::integer`
    })
    .eq("user_id", user.id);

  if (profileError) {
    throw new Error("Erreur lors de la mise à jour du solde");
  }

  return { success: true, transaction };
}
