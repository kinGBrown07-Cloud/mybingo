import { NextResponse } from 'next/server';
import { getActiveAdBanners } from '@/lib/services/adService';

export async function GET() {
  try {
    // Récupérer les bannières publicitaires actives
    const adBanners = await getActiveAdBanners();
    
    return NextResponse.json(adBanners);
  } catch (error) {
    console.error('Erreur lors de la récupération des bannières publicitaires:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des bannières publicitaires' },
      { status: 500 }
    );
  }
}
