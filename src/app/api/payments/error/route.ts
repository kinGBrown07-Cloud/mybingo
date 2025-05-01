import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { orderId, error } = await request.json();
    
    // Vérifier que les paramètres requis sont présents
    if (!orderId) {
      return NextResponse.json(
        { error: 'Le paramètre orderId est requis' },
        { status: 400 }
      );
    }
    
    try {
      // Rechercher la transaction associée à cet orderId avec SQL brut
      const transactions = await prisma.$queryRaw<Array<{ id: string; status: string; description: string }>>`
        SELECT id, status, description
        FROM transactions
        WHERE description LIKE ${'%' + orderId + '%'}
        LIMIT 1
      `;
      
      // Vérifier si une transaction a été trouvée
      if (!transactions || transactions.length === 0) {
        console.log('Aucune transaction trouvée pour cet orderId:', orderId);
        
        // Retourner une réponse simulée
        return NextResponse.json({
          transactionId: 'error-' + orderId,
          status: 'FAILED',
          simulatedError: true
        });
      }
      
      const transaction = transactions[0];
      console.log('Transaction trouvée:', transaction);
      
      // Mettre à jour la transaction pour indiquer l'échec avec SQL brut
      const updatedTransaction = await prisma.$queryRaw`
        UPDATE transactions
        SET status = 'FAILED', 
            description = ${`Échec du paiement PayPal: ${error?.message || 'Erreur inconnue'} (OrderID: ${orderId}, Échec à: ${new Date().toISOString()})`}
        WHERE id = ${transaction.id}::uuid
        RETURNING id, status
      `;
      
      console.log('Transaction mise à jour avec succès:', updatedTransaction);
      
      // Si nous arrivons ici, la transaction a été mise à jour avec succès
      const result = Array.isArray(updatedTransaction) ? updatedTransaction[0] : updatedTransaction;
      
      // Retourner les informations de la transaction
      return NextResponse.json({
        transactionId: result.id,
        status: result.status
      });
    } catch (dbError) {
      console.error('Erreur lors de la mise à jour de la transaction dans la base de données:', dbError);
      
      // Simuler une transaction en échec
      return NextResponse.json({
        transactionId: 'error-' + orderId,
        status: 'FAILED',
        simulatedError: true
      });
    }
  } catch (error) {
    console.error('Erreur lors du traitement de l\'erreur de paiement:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors du traitement de l\'erreur de paiement' },
      { status: 500 }
    );
  }
}
