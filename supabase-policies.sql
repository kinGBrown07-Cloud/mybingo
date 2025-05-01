-- Activer RLS (Row Level Security) sur la table profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Permettre à tous les utilisateurs authentifiés de lire leur propre profil
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

-- Permettre aux utilisateurs authentifiés de mettre à jour leur propre profil
CREATE POLICY "Users can update their own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

-- Permettre aux utilisateurs authentifiés de créer leur propre profil
CREATE POLICY "Users can insert their own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Permettre aux administrateurs (role = 'admin') de voir tous les profils
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Créer une fonction pour créer automatiquement un profil lors de l'inscription d'un utilisateur
CREATE OR REPLACE FUNCTION public.create_profile_for_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, first_name, last_name, points)
  VALUES (NEW.id, '', '', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Créer un trigger pour appeler la fonction après l'insertion d'un nouvel utilisateur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_profile_for_user();
