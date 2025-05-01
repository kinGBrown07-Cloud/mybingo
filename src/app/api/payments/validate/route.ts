import { NextResponse } from 'next/server';
import { pricingService } from '@/lib/services/pricingService';

export async function POST(request: Request) {
  try {
    const { amount, userId } = await request.json();
    
    // Vérifier que les paramètres requis sont présents
    if (!amount || !userId) {
      return NextResponse.json(
        { error: 'Les paramètres amount et userId sont requis' },
        { status: 400 }
      );
    }
    
    // Valider l'achat
    const validation = await pricingService.validatePurchase(amount, userId);
    
    // Retourner le résultat de la validation
    return NextResponse.json(validation);
  } catch (error) {
    console.error('Erreur lors de la validation de l\'achat:', error);
    
    // En cas d'erreur, retourner un résultat par défaut pour ne pas bloquer le paiement
    return NextResponse.json(
      { 
        points: 0, 
        bonus: 0,
        error: 'Une erreur est survenue lors de la validation'
      },
      { status: 500 }
    );
  }
}
