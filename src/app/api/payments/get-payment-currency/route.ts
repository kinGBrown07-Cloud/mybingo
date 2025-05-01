import { NextResponse } from 'next/server';
import { pricingService } from '@/lib/services/pricingService';
import { Region } from '@/lib/constants/regions';

export async function POST(request: Request) {
  try {
    const { region } = await request.json();
    
    // Vérifier que le paramètre région est présent
    if (!region) {
      return NextResponse.json(
        { error: 'Le paramètre region est requis' },
        { status: 400 }
      );
    }
    
    // Obtenir la devise compatible PayPal pour cette région
    const paymentCurrencyConfig = pricingService.getPaymentCurrency(region as Region);
    
    // Retourner le code de devise
    return NextResponse.json({
      currency: paymentCurrencyConfig.code,
      symbol: paymentCurrencyConfig.symbol
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de la devise de paiement:', error);
    
    // En cas d'erreur, retourner EUR par défaut
    return NextResponse.json(
      { 
        currency: 'EUR',
        symbol: '€',
        error: 'Une erreur est survenue lors de la récupération de la devise'
      },
      { status: 500 }
    );
  }
}
