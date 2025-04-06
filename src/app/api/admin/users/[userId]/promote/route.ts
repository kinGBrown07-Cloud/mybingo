import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { UserRole } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { userId } = params;
    const { currentRole } = await request.json();

    // Déterminer le nouveau rôle
    let newRole = UserRole.USER;
    if (currentRole === UserRole.USER) {
      newRole = UserRole.MODERATOR;
    } else if (currentRole === UserRole.MODERATOR) {
      newRole = UserRole.ADMIN;
    }

    // Mettre à jour le rôle de l'utilisateur
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { role: newRole },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[PROMOTE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
