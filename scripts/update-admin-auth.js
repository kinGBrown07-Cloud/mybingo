import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obtenir le chemin du répertoire actuel avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste des fichiers à mettre à jour
const filesToUpdate = [
  'src/app/admin/vip/page.tsx',
  'src/app/admin/transactions/page.tsx',
  'src/app/admin/settings/page.tsx',
  'src/app/admin/games/page.tsx'
];

// Fonction pour mettre à jour un fichier
function updateFile(filePath) {
  // Utiliser le chemin absolu à partir du répertoire du projet
  const fullPath = path.join(path.resolve(), filePath);
  
  // Lire le contenu du fichier
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // Remplacer les imports
  content = content.replace(
    "import { useSession } from 'next-auth/react';",
    "import { useRouter } from 'next/navigation';\nimport { supabase } from '@/lib/supabase-client';"
  );
  
  // Remplacer l'utilisation de useSession
  content = content.replace(
    /const \{ data: session \} = useSession\(\);/g,
    `const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null>(null);`
  );
  
  // Remplacer les useEffect qui utilisent session
  content = content.replace(
    /useEffect\(\s*\(\)\s*=>\s*\{\s*if\s*\(session\?\.user\)\s*\{[\s\S]*?\}\s*\},\s*\[session,\s*.*?\]\);/g,
    `useEffect(() => {
    async function checkAuth() {
      try {
        // Vérifier si l'utilisateur est authentifié
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        
        if (error || !supabaseUser) {
          console.log('Utilisateur non authentifié, redirection vers login');
          router.push('/auth/login');
          return;
        }
        
        // Vérifier si l'utilisateur est admin
        const isAdmin = 
          supabaseUser.user_metadata?.role === 'ADMIN' || 
          supabaseUser.app_metadata?.role === 'ADMIN';
        
        if (!isAdmin) {
          console.log('Utilisateur non admin, redirection vers dashboard');
          router.push('/dashboard');
          return;
        }
        
        setUser(supabaseUser);
        fetchData();
      } catch (error) {
        console.error('Erreur lors de la vérification de l\\'authentification:', error);
        router.push('/auth/login');
      }
    }
    
    checkAuth();
  }, [router]);`
  );
  
  // Écrire le contenu mis à jour dans le fichier
  fs.writeFileSync(fullPath, content, 'utf8');
  
  console.log(`Fichier mis à jour: ${filePath}`);
}

// Mettre à jour tous les fichiers
filesToUpdate.forEach(updateFile);

console.log('Tous les fichiers ont été mis à jour avec succès!');
