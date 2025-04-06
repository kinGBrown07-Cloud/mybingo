import fetch from 'node-fetch';

async function testLoginApi() {
  console.log('Test de la route API de connexion...');
  
  const email = 'test2@example.com';
  const password = 'Test123!';

  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur:', data.error);
      return;
    }

    if (data.success && data.token) {
      console.log('✅ Connexion réussie !');
      console.log('Token JWT:', data.token.substring(0, 20) + '...');
      console.log('Profil:', {
        id: data.profile.id,
        email: data.profile.email,
        username: data.profile.username,
        coins: data.profile.coins,
        points: data.profile.points
      });
    } else {
      console.error('❌ Réponse invalide:', data);
    }
  } catch (error) {
    console.error('❌ Erreur inattendue:', error);
  }
}

testLoginApi();
