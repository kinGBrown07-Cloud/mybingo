import { Metadata } from "next";
import { AffiliateStats } from "@/components/affiliate/affiliate-stats";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Programme d'Affiliation | Bingoo",
  description: "Gagnez des récompenses en parrainant vos amis sur Bingoo",
};

export default async function AffiliatePage() {
  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);

  // Vérifier l'authentification
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth/login');
  }

  // Récupérer les statistiques d'affiliation
  const { data: profile } = await supabase
    .from('profiles')
    .select('affiliate_code, affiliate_earnings')
    .eq('id', session.user.id)
    .single();

  // Récupérer les filleuls
  const { data: referrals } = await supabase
    .from('affiliate_earnings')
    .select(`
      amount,
      created_at,
      profiles:referred_id (
        username,
        first_name,
        last_name
      )
    `)
    .eq('referrer_id', session.user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Programme d'Affiliation</h1>
      <AffiliateStats
        affiliateCode={profile?.affiliate_code || ''}
        totalEarnings={profile?.affiliate_earnings || 0}
        referrals={referrals || []}
      />
    </div>
  );
}
