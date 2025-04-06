import { auth } from '../src/lib/auth/index.js';
import { Region, Currency } from '@prisma/client';

async function testSignUp() {
  try {
    console.log('\n=== Test d\'inscription ===');
    
    const signUpData = {
      email: 'test2@example.com',
      password: 'Test123!',
      firstName: 'Test',
      lastName: 'User',
      phoneNumber: '+1234567890',
      country: 'Senegal',
      region: Region.BLACK_AFRICA,
      currency: Currency.XOF,
      acceptTerms: true
    };

    console.log('\nDonnées d\'inscription:', JSON.stringify(signUpData, null, 2));

    const result = await auth.signUp(signUpData);
    console.log('\nRésultat de l\'inscription:', JSON.stringify(result, null, 2));

    if (result.error) {
      console.error('\nErreur lors de l\'inscription:', result.error);
      return;
    }

    console.log('\n=== Test de connexion ===');
    const loginResult = await auth.signIn(signUpData.email, signUpData.password);
    console.log('\nRésultat de la connexion:', JSON.stringify(loginResult, null, 2));

    if (loginResult.error) {
      console.error('\nErreur lors de la connexion:', loginResult.error);
      return;
    }

    if (loginResult.token) {
      console.log('\n=== Test de récupération du profil ===');
      const profile = await auth.getCurrentUser(loginResult.token);
      console.log('\nProfil récupéré:', JSON.stringify(profile, null, 2));
    }

    console.log('\n=== Tests terminés avec succès ===\n');

  } catch (error) {
    console.error('\nErreur lors des tests:', error);
  }
}

testSignUp();
