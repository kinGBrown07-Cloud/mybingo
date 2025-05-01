import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { TransactionType, TransactionStatus } from "@prisma/client";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { type NextRequest } from "next/server";

export async function POST(request: NextRequest, context: { params: { userId: string } }) {
  try {
    // Vérifier l'authentification avec Supabase
    const { data: { user } } = await supabaseAdmin.auth.getUser();
    
    if (!user || !user.user_metadata?.role || user.user_metadata.role !== 'ADMIN') {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { points } = await request.json();
    const { userId } = context.params;

    if (!points || isNaN(points) || points <= 0) {
      return new NextResponse("Invalid points value", { status: 400 });
    }

    // Mettre à jour les points de l'utilisateur et créer une transaction
    const [updatedUser, transaction] = await prisma.$transaction([
      // Mettre à jour les points de l'utilisateur
      prisma.user.update({
        where: { id: userId },
        data: { 
          points: { increment: points }
        },
      }),
      // Créer une transaction
      prisma.transaction.create({
        data: {
          userId,
          type: TransactionType.WIN,
          pointsAmount: points,
          status: TransactionStatus.COMPLETED
        },
      }),
    ]);

    return NextResponse.json({
      user: updatedUser,
      transaction: transaction,
    });
  } catch (error) {
    console.error("[CREDIT_POINTS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
