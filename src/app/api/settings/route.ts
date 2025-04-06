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

    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id
      },
      include: {
        settings: true
      }
    });

    if (!user?.settings) {
      // Créer les paramètres par défaut si ils n'existent pas
      const defaultSettings = await prisma.user.update({
        where: {
          id: session.user.id
        },
        data: {
          settings: {
            create: {
              notifications: true,
              soundEnabled: true,
              volume: 50,
              darkMode: false,
              language: 'fr',
              currency: 'XOF'
            }
          }
        },
        include: {
          settings: true
        }
      });
      return NextResponse.json(defaultSettings.settings);
    }

    return NextResponse.json(user.settings);
  } catch (error) {
    console.error('Error in settings GET:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { notifications, soundEnabled, volume, darkMode, language, currency } = body;

    const user = await prisma.user.update({
      where: {
        id: session.user.id
      },
      data: {
        settings: {
          upsert: {
            create: {
              notifications,
              soundEnabled,
              volume,
              darkMode,
              language,
              currency
            },
            update: {
              notifications,
              soundEnabled,
              volume,
              darkMode,
              language,
              currency
            }
          }
        }
      },
      include: {
        settings: true
      }
    });

    return NextResponse.json(user.settings);
  } catch (error) {
    console.error('Error in settings PUT:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
