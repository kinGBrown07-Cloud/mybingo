import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // In Next.js App Router, params is already resolved and doesn't need to be awaited
    // But we need to handle it properly to avoid the warning
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur depuis Prisma avec son profil
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Récupérer les métadonnées de l'utilisateur depuis Supabase avec le client admin
    const { data: { user: supabaseUser }, error } = await supabaseAdmin.auth.admin.getUserById(id);

    if (error) {
      console.error('Error fetching Supabase user:', error);
    }

    // Combiner les données Prisma et Supabase
    const userData = {
      ...user,
      supabaseMetadata: supabaseUser ? {
        role: supabaseUser.user_metadata?.role || supabaseUser.app_metadata?.role,
        email_confirmed: supabaseUser.email_confirmed_at ? true : false,
        last_sign_in: supabaseUser.last_sign_in_at
      } : null
    };

    return NextResponse.json(userData);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}
