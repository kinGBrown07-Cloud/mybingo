import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { Prisma, User, Profile } from '@prisma/client';

export async function POST(req: Request) {
  try {
    console.log('Starting file upload...');
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('No session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }
    console.log('Session found:', session.user.id);

    console.log('Parsing form data...');
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file in form data');
      return new NextResponse('No file provided', { status: 400 });
    }
    console.log('File received:', file.name, file.type, file.size);

    // Vérifier le type de fichier
    if (!file.type.startsWith('image/')) {
      return new NextResponse('Invalid file type', { status: 400 });
    }

    // Vérifier la taille du fichier (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return new NextResponse('File too large', { status: 400 });
    }

    // Créer le dossier uploads s'il n'existe pas
    console.log('Creating upload directory...');
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    try {
      await mkdir(uploadDir, { recursive: true });
      console.log('Upload directory created/verified:', uploadDir);
    } catch (error) {
      console.error('Error creating upload directory:', error);
      throw new Error('Could not create upload directory');
    }

    // Générer un nom de fichier unique
    console.log('Generating filename...');
    const ext = file.name.split('.').pop();
    const filename = `${session.user.id}-${Date.now()}.${ext}`;
    const filepath = path.join(uploadDir, filename);
    console.log('File will be saved as:', filepath);

    // Convertir le File en Buffer
    console.log('Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sauvegarder le fichier
    console.log('Saving file...');
    await writeFile(filepath, buffer);
    console.log('File saved successfully');

    // Construire l'URL relative
    const imageUrl = `/uploads/${filename}`;

    // Mettre à jour l'URL de l'image dans le profil et l'utilisateur
    console.log('Updating database with new image URL:', imageUrl);
    try {
      await prisma.$transaction(async (tx) => {
        // Mettre à jour le photoId de l'utilisateur et le profil
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            photoId: filename
          } as Prisma.UserUpdateInput
        });

        // Récupérer le profil pour vérifier qu'il existe
        const profile = await tx.profile.findUnique({
          where: { userId: session.user.id }
        });

        if (!profile) {
          throw new Error('Profile not found');
        }

        // Mettre à jour l'URL de l'image du profil
        await tx.profile.update({
          where: { id: profile.id },
          data: {
            image_url: imageUrl
          } as Prisma.ProfileUpdateInput
        });
      });

      console.log('Database updated successfully');
      return NextResponse.json({ url: imageUrl });
    } catch (dbError) {
      console.error('Database update error:', dbError);
      throw new Error('Failed to update profile image in database');
    }
  } catch (error) {
    console.error('Error in upload:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
