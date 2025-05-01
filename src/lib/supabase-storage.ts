import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { v4 as uuidv4 } from 'uuid';

// Noms des buckets de stockage
export const STORAGE_BUCKETS = {
  PROFILE_IMAGES: 'profile-images',
  AD_BANNERS: 'ad-banners',
};

// Types d'images acceptés
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

// Taille maximale des fichiers (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Télécharge une image de profil vers Supabase Storage
 * @param file Fichier à télécharger
 * @param userId ID de l'utilisateur
 * @returns URL de l'image téléchargée ou null en cas d'erreur
 */
export async function uploadProfileImage(file: File, userId: string): Promise<string | null> {
  try {
    const supabase = createClientComponentClient();
    
    // Vérifier le type de fichier
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Type de fichier non pris en charge. Utilisez JPG, PNG, WebP ou GIF.');
    }
    
    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Le fichier est trop volumineux. Taille maximale: 5MB.');
    }
    
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${uuidv4()}.${fileExt}`;
    const filePath = `${userId}/${fileName}`;
    
    // Télécharger le fichier
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Erreur lors du téléchargement:', error);
      return null;
    }
    
    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Erreur lors du téléchargement de l\'image de profil:', error);
    return null;
  }
}

/**
 * Télécharge une bannière publicitaire vers Supabase Storage
 * @param file Fichier à télécharger
 * @param adminId ID de l'administrateur qui télécharge
 * @returns URL de l'image téléchargée ou null en cas d'erreur
 */
export async function uploadAdBanner(file: File, adminId: string): Promise<string | null> {
  try {
    const supabase = createClientComponentClient();
    
    // Vérifier le type de fichier
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      throw new Error('Type de fichier non pris en charge. Utilisez JPG, PNG, WebP ou GIF.');
    }
    
    // Vérifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      throw new Error('Le fichier est trop volumineux. Taille maximale: 5MB.');
    }
    
    // Générer un nom de fichier unique
    const fileExt = file.name.split('.').pop();
    const fileName = `ad-${uuidv4()}.${fileExt}`;
    const filePath = `banners/${fileName}`;
    
    // Télécharger le fichier
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKETS.AD_BANNERS)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (error) {
      console.error('Erreur lors du téléchargement:', error);
      return null;
    }
    
    // Obtenir l'URL publique
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKETS.AD_BANNERS)
      .getPublicUrl(filePath);
    
    return publicUrl;
  } catch (error) {
    console.error('Erreur lors du téléchargement de la bannière:', error);
    return null;
  }
}

/**
 * Supprime une image de profil de Supabase Storage
 * @param url URL de l'image à supprimer
 * @param userId ID de l'utilisateur
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteProfileImage(url: string, userId: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    
    // Extraire le chemin du fichier de l'URL
    const path = url.split('/').pop();
    if (!path) return false;
    
    const filePath = `${userId}/${path}`;
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.PROFILE_IMAGES)
      .remove([filePath]);
    
    if (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'image de profil:', error);
    return false;
  }
}

/**
 * Supprime une bannière publicitaire de Supabase Storage
 * @param url URL de l'image à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteAdBanner(url: string): Promise<boolean> {
  try {
    const supabase = createClientComponentClient();
    
    // Extraire le chemin du fichier de l'URL
    const path = url.split('/').pop();
    if (!path) return false;
    
    const filePath = `banners/${path}`;
    
    const { error } = await supabase.storage
      .from(STORAGE_BUCKETS.AD_BANNERS)
      .remove([filePath]);
    
    if (error) {
      console.error('Erreur lors de la suppression:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la bannière:', error);
    return false;
  }
}
