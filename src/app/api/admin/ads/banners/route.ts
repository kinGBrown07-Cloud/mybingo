import { NextResponse } from 'next/server';
import { createAdBanner, deleteAdBanner, getAllAdBanners, getAdBannerById, updateAdBanner } from '@/lib/services/adService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Vérifier si l'utilisateur est un administrateur
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

// GET - Récupérer toutes les bannières (pour l'interface d'administration)
export async function GET() {
  try {
    // Vérifier les autorisations
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const banners = await getAllAdBanners();
    return NextResponse.json(banners);
  } catch (error) {
    console.error('Erreur lors de la récupération des bannières:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération des bannières' },
      { status: 500 }
    );
  }
}

// POST - Créer une nouvelle bannière
export async function POST(request: Request) {
  try {
    // Vérifier les autorisations
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    
    if (!userId) {
      return NextResponse.json({ error: 'Utilisateur non identifié' }, { status: 401 });
    }
    
    const data = await request.json();
    
    // Valider les données
    if (!data.title || !data.description || !data.imageUrl) {
      return NextResponse.json(
        { error: 'Titre, description et image sont requis' },
        { status: 400 }
      );
    }
    
    // Convertir les dates en objets Date
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    
    // Activer la bannière par défaut
    data.isActive = data.isActive !== undefined ? data.isActive : true;
    
    const banner = await createAdBanner(data, userId);
    
    if (!banner) {
      return NextResponse.json(
        { error: 'Erreur lors de la création de la bannière' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(banner, { status: 201 });
  } catch (error) {
    console.error('Erreur lors de la création de la bannière:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la création de la bannière' },
      { status: 500 }
    );
  }
}
