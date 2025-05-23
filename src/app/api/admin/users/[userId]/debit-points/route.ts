import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { UserRole, TransactionType, TransactionStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { points } = await request.json();
    const userId = params.userId;

    if (!points || isNaN(points) || points <= 0) {
      return new NextResponse("Invalid points value", { status: 400 });
    }

    // Vérifier si l'utilisateur a assez de points
    const userProfile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!userProfile) {
      return new NextResponse("User profile not found", { status: 404 });
    }

    if (userProfile.points < points) {
      return new NextResponse("Insufficient points balance", { status: 400 });
    }

    // Mettre à jour les points de l'utilisateur et créer une transaction
    const [updatedProfile, transaction] = await prisma.$transaction([
      // Mettre à jour le profil
      prisma.profile.update({
        where: { userId },
        data: { 
          points: { decrement: points },
          coins: { decrement: points } // Mise à jour du solde en coins également
        },
      }),
      // Créer une transaction
      prisma.transaction.create({
        data: {
          profile: { connect: { userId } },
          type: TransactionType.WITHDRAWAL,
          amount: points,
          pointsAmount: points,
          currency: "XOF",
          status: TransactionStatus.COMPLETED
        },
      }),
    ]);

    return NextResponse.json({
      profile: updatedProfile,
      transaction: transaction,
    });
  } catch (error) {
    console.error("[DEBIT_POINTS_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
