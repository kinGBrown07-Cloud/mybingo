"use client";

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/components/ui/use-toast';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { ACCEPTED_IMAGE_TYPES, MAX_FILE_SIZE } from '@/lib/supabase-storage';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<string | null>;
  currentImageUrl?: string;
  className?: string;
  label?: string;
}

export function ImageUpload({ 
  onUpload, 
  currentImageUrl, 
  className = '',
  label = 'Image'
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vu00e9rifier le type de fichier
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Type de fichier non pris en charge. Utilisez JPG, PNG, WebP ou GIF.');
      return;
    }

    // Vu00e9rifier la taille du fichier
    if (file.size > MAX_FILE_SIZE) {
      setError('Le fichier est trop volumineux. Taille maximale: 5MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    // Cru00e9er une URL de pru00e9visualisation
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Simuler une progression de tu00e9lu00e9chargement
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 100);

    try {
      // Tu00e9lu00e9charger le fichier
      const uploadedUrl = await onUpload(file);

      if (uploadedUrl) {
        setUploadProgress(100);
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
          toast({
            title: "Tu00e9lu00e9chargement ru00e9ussi",
            description: "L'image a u00e9tu00e9 tu00e9lu00e9chargu00e9e avec succu00e8s.",
          });
        }, 500);
      } else {
        throw new Error("u00c9chec du tu00e9lu00e9chargement");
      }
    } catch (error) {
      setError("Une erreur s'est produite lors du tu00e9lu00e9chargement.");
      setIsUploading(false);
      setUploadProgress(0);
      clearInterval(interval);
      toast({
        title: "Erreur de tu00e9lu00e9chargement",
        description: error instanceof Error ? error.message : "Une erreur s'est produite",
        variant: "destructive",
      });
    }

    // Nettoyer l'URL de pru00e9visualisation lorsque le composant est du00e9montu00e9
    return () => URL.revokeObjectURL(objectUrl);
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="image-upload">{label}</Label>
      
      <div className="flex items-center gap-4">
        <Input
          id="image-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleFileChange}
          className="hidden"
          ref={fileInputRef}
          disabled={isUploading}
        />
        
        <Button
          type="button"
          variant="outline"
          onClick={handleButtonClick}
          disabled={isUploading}
          className="flex items-center gap-2"
        >
          <Upload size={16} />
          {isUploading ? 'Tu00e9lu00e9chargement...' : 'Choisir une image'}
        </Button>
        
        {previewUrl && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={handleRemoveImage}
            disabled={isUploading}
          >
            <X size={16} />
          </Button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      
      {isUploading && (
        <div className="space-y-2">
          <Progress value={uploadProgress} className="h-2" />
          <p className="text-xs text-gray-500">{uploadProgress}% tu00e9lu00e9chargu00e9</p>
        </div>
      )}
      
      {previewUrl ? (
        <div className="relative aspect-square w-40 overflow-hidden rounded-md border border-gray-200">
          <Image
            src={previewUrl}
            alt="Aperu00e7u de l'image"
            fill
            className="object-cover"
          />
        </div>
      ) : (
        <div className="flex aspect-square w-40 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-50">
          <ImageIcon className="h-10 w-10 text-gray-400" />
        </div>
      )}
    </div>
  );
}
