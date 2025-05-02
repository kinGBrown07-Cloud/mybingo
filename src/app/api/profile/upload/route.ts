import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
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

    // Vérifier si l'utilisateur existe dans Prisma
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found in database' }, { status: 404 });
    }

    // Traiter le formulaire multipart
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only JPG, PNG, WEBP and GIF are allowed' 
      }, { status: 400 });
    }

    // Limiter la taille du fichier (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File size exceeds the limit of 5MB' 
      }, { status: 400 });
    }

    // Convertir le File en ArrayBuffer puis en Uint8Array pour Supabase
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = new Uint8Array(arrayBuffer);

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop();
    const fileName = `${userId}_${Date.now()}.${fileExtension}`;
    const filePath = `${userId}/${fileName}`;

    // Télécharger le fichier vers Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from('profile-images')
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading file to Supabase:', uploadError);
      return NextResponse.json({ 
        error: 'Failed to upload image: ' + uploadError.message 
      }, { status: 500 });
    }

    // Obtenir l'URL publique de l'image
    const { data: { publicUrl } } = supabaseAdmin
      .storage
      .from('profile-images')
      .getPublicUrl(filePath);

    // Mettre à jour le profil de l'utilisateur avec l'URL de l'image
    const updatedProfile = await prisma.profile.update({
      where: { userId },
      data: {
        image_url: publicUrl
      }
    });

    // Mettre également à jour les métadonnées de l'utilisateur dans Supabase
    await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...userData.user.user_metadata,
        avatar_url: publicUrl
      }
    });

    return NextResponse.json({
      success: true,
      profile: updatedProfile,
      image_url: publicUrl
    });
  } catch (error) {
    console.error('Error in profile upload:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal Server Error' 
    }, { status: 500 });
  }
}
