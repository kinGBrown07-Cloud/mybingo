import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function GET(request: Request) {
  try {
    // Récupérer l'userId de la requête
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Récupérer l'utilisateur et son profil depuis Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Ajouter des logs pour le débogage
    console.log('User found:', userId);
    console.log('User profile:', user.profile ? 'exists' : 'not found');

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error in profile GET:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    // Récupérer l'userId de la requête
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Vérifier si l'utilisateur existe dans Supabase avec le client admin
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    
    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validation des champs requis pour la mise à jour du profil
    const requiredFields = ['firstName', 'lastName', 'country'];
    const missingFields = requiredFields.filter(field => body[field] === undefined);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Champs requis manquants: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    // Mise à jour du profil
    const updateData = {
      firstName: body.firstName,
      lastName: body.lastName,
      country: body.country,
      ...(body.phoneNumber && { phoneNumber: body.phoneNumber }),
      ...(body.birthdate && { birthdate: new Date(body.birthdate) }),
      ...(body.region && { region: body.region }),
      ...(body.currency && { currency: body.currency }),
    };

    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    return NextResponse.json(updatedProfile);
  } catch (error) {
    console.error('Error in profile PUT:', error);
    
    // Gestion spécifique des erreurs Prisma
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json({ 
          error: 'Cet email ou nom d\'utilisateur est déjà utilisé' 
        }, { status: 409 });
      }
    }
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
