import { auth } from '../src/lib/auth';

async function testLogin() {
  console.log('Test de connexion...');
  
  const email = 'test2@example.com';
  const password = 'Test123!';

  try {
    const result = await auth.signIn(email, password);
    
    if (result.error) {
      console.error('❌ Erreur de connexion:', result.error);
      return;
    }

    if (!result.token || !result.profile) {
      console.error('❌ Token ou profil manquant');
      return;
    }

    console.log('✅ Connexion réussie !');
    console.log('Token JWT:', result.token.substring(0, 20) + '...');
    console.log('Profil:', {
      id: result.profile.id,
      email: result.profile.email,
      username: result.profile.username,
      coins: result.profile.coins,
      points: result.profile.points
    });
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testLogin();
