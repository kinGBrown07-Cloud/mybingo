import { NextResponse } from 'next/server';
import { deleteAdBanner, getAdBannerById, updateAdBanner } from '@/lib/services/adService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Vérifier si l'utilisateur est un administrateur
async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'ADMIN';
}

// GET - Récupérer une bannière spécifique
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Vérifier les autorisations
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const { id } = params;
    const banner = await getAdBannerById(id);
    
    if (!banner) {
      return NextResponse.json({ error: 'Bannière non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json(banner);
  } catch (error) {
    console.error('Erreur lors de la récupération de la bannière:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la récupération de la bannière' },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour une bannière existante
export async function PUT(request: Request, { params }: { params: { id: string } }) {
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
    
    const { id } = params;
    const data = await request.json();
    
    // Convertir les dates en objets Date si elles sont fournies
    if (data.startDate) data.startDate = new Date(data.startDate);
    if (data.endDate) data.endDate = new Date(data.endDate);
    
    const updatedBanner = await updateAdBanner(id, data, userId);
    
    if (!updatedBanner) {
      return NextResponse.json({ error: 'Bannière non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json(updatedBanner);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la bannière:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la mise à jour de la bannière' },
      { status: 500 }
    );
  }
}

// DELETE - Supprimer une bannière
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // Vérifier les autorisations
    if (!await isAdmin()) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }
    
    const { id } = params;
    const success = await deleteAdBanner(id);
    
    if (!success) {
      return NextResponse.json({ error: 'Bannière non trouvée' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur lors de la suppression de la bannière:', error);
    return NextResponse.json(
      { error: 'Une erreur est survenue lors de la suppression de la bannière' },
      { status: 500 }
    );
  }
}
