import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { pricingService } from '@/lib/services/pricingService';
import { Region } from '@/lib/constants/regions';

export async function POST(request: Request) {
  try {
    const { userId, points, paymentMethod, accountInfo } = await request.json();
    
    // Vérifier que les paramètres requis sont présents
    if (!userId || !points || !paymentMethod) {
      return NextResponse.json(
        { error: 'Paramètres manquants pour le retrait' },
        { status: 400 }
      );
    }
    
    // Vérifier que le nombre de points est valide (> 0)
    if (points <= 0) {
      return NextResponse.json(
        { error: 'Le nombre de points doit être supérieur à 0' },
        { status: 400 }
      );
    }
    
    try {
      // Vérifier que l'utilisateur a suffisamment de points
      const profile = await prisma.profile.findFirst({
        where: { userId: userId }
      });
      
      if (!profile) {
        return NextResponse.json(
          { error: 'Profil utilisateur non trouvé' },
          { status: 404 }
        );
      }
      
      // Récupérer le solde actuel de points
      const currentBalance = await prisma.$queryRaw<Array<{ balance: number }>>`
        SELECT COALESCE(SUM(
          CASE 
            WHEN type = 'PAYMENT' AND status = 'COMPLETED' THEN points_amount + bonus
            WHEN type = 'WIN' AND status = 'COMPLETED' THEN points_amount
            WHEN type = 'WITHDRAWAL' AND status = 'COMPLETED' THEN -points_amount
            ELSE 0
          END
        ), 0) as balance
        FROM transactions
        WHERE user_id = ${userId}::uuid
      `;
      
      const balance = currentBalance[0]?.balance || 0;
      
      if (balance < points) {
        return NextResponse.json(
          { error: 'Solde insuffisant pour effectuer ce retrait' },
          { status: 400 }
        );
      }
      
      // Déterminer la région de l'utilisateur pour la conversion
      const userRegion = profile.country ? 
        pricingService.getRegionFromCountry(profile.country) : 
        Region.BLACK_AFRICA;
      
      // Obtenir le taux de conversion pour cette région
      const conversionRate = pricingService.getPointsRate(userRegion);
      
      // Calculer le montant en devise locale
      const currency = pricingService.getCurrency(userRegion);
      const amount = points / conversionRate;
      
      // Créer une transaction de retrait
      const transactionId = uuidv4();
      const transaction = await prisma.$queryRaw<Array<{ id: string; userId: string; pointsAmount: number; status: string; createdAt: Date }>>`
        INSERT INTO transactions (
          id, 
          user_id, 
          points_amount, 
          status, 
          description, 
          type,
          created_at
        )
        VALUES (
          ${transactionId}::uuid, 
          ${userId}::uuid, 
          ${points}, 
          'PENDING', 
          ${`Retrait de ${points} points (${amount.toFixed(2)} ${currency.code}) via ${paymentMethod}`}, 
          'WITHDRAWAL',
          NOW()
        )
        RETURNING id, user_id as "userId", points_amount as "pointsAmount", status, created_at as "createdAt"
      `;
      
      // Retourner les informations de la transaction
      return NextResponse.json({
        transactionId: transaction[0].id,
        userId: transaction[0].userId,
        pointsAmount: transaction[0].pointsAmount,
        status: transaction[0].status,
        createdAt: transaction[0].createdAt,
        amount: amount.toFixed(2),
        currency: currency.code,
        paymentMethod,
        message: 'Demande de retrait créée avec succès. Notre équipe traitera votre demande dans les 24-48 heures.'
      });
      
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      return NextResponse.json(
        { error: 'Une erreur est survenue lors du traitement de votre demande de retrait' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Erreur lors du traitement de la requête:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de votre demande' },
      { status: 500 }
    );
  }
}
