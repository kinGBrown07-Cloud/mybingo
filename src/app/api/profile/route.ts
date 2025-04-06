import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Récupérer le profil de l'utilisateur depuis la base de données
    const userWithProfile = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true }
    });

    return NextResponse.json({
      id: session.user.id,
      email: session.user.email || '',
      name: session.user.name || '',
      role: session.user.role,
      profile: userWithProfile?.profile
    });
  } catch (error) {
    console.error('Error in profile GET:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    
    // Validation des champs requis du modèle User
    const requiredFields = ['email', 'username', 'country', 'currency', 'points_rate', 'region'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json({ 
        error: `Champs requis manquants: ${missingFields.join(', ')}` 
      }, { status: 400 });
    }

    const updateData = {
      where: {
        id: session.user.id,
      },
      data: {
        email: body.email,
        username: body.username,
        password_hash: body.password_hash, // Si fourni
        first_name: body.first_name || null,
        last_name: body.last_name || null,
        phone_number: body.phone_number || null,
        country: body.country,
        currency: body.currency,
        points_rate: body.points_rate,
        region: body.region,
        profile: {
          upsert: {
            create: {
              firstName: body.first_name || '',
              lastName: body.last_name || '',
              country: body.country
            },
            update: {
              firstName: body.first_name || undefined,
              lastName: body.last_name || undefined,
              country: body.country
            }
          }
        }
      },
      include: {
        profile: true,
      },
    };

    console.log('Update Data:', updateData); // Pour le débogage

    const user = await prisma.user.update(updateData);
    return NextResponse.json({ 
      success: true,
      user 
    });
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
