"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ProfileImageUploadProps {
  userId: string;
  currentImageUrl?: string;
  firstName: string;
  lastName: string;
  onImageUploaded?: (image_url: string) => void;
}

export function ProfileImageUpload({
  userId,
  currentImageUrl,
  firstName,
  lastName,
  onImageUploaded
}: ProfileImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [image_url, setImageUrl] = useState(currentImageUrl || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        variant: 'destructive',
        title: 'Type de fichier non valide',
        description: 'Seuls les formats JPG, PNG, WEBP et GIF sont acceptés.'
      });
      return;
    }

    // Vérifier la taille du fichier (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        variant: 'destructive',
        title: 'Fichier trop volumineux',
        description: 'La taille du fichier ne doit pas dépasser 5MB.'
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`/api/profile/upload?userId=${userId}`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Une erreur est survenue lors du téléchargement');
      }

      setImageUrl(data.image_url);
      
      toast({
        title: 'Photo de profil mise à jour',
        description: 'Votre photo de profil a été mise à jour avec succès.'
      });

      if (onImageUploaded) {
        onImageUploaded(data.image_url);
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue lors du téléchargement'
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Générer les initiales pour l'avatar fallback
  const getInitials = () => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-24 w-24 border-2 border-purple-500">
        <AvatarImage src={image_url} alt={`${firstName} ${lastName}`} />
        <AvatarFallback className="bg-purple-700 text-white text-xl">
          {getInitials()}
        </AvatarFallback>
      </Avatar>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
      />
      
      <Button 
        variant="outline" 
        onClick={handleUploadClick}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Téléchargement...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4" />
            Changer la photo
          </>
        )}
      </Button>
    </div>
  );
}
