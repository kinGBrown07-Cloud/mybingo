import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Aide - Bingoo',
  description: 'Centre d\'aide de Bingoo',
};

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Centre d'aide</h1>
      <div className="prose prose-invert max-w-none">
        <h2>Questions fréquentes</h2>
        
        <h3>Comment créer un compte ?</h3>
        <p>
          Pour créer un compte, cliquez sur le bouton "S'inscrire" et remplissez le formulaire avec vos informations personnelles.
        </p>

        <h3>Comment réinitialiser mon mot de passe ?</h3>
        <p>
          Si vous avez oublié votre mot de passe, cliquez sur "Mot de passe oublié" sur la page de connexion et suivez les instructions.
        </p>

        <h3>Comment contacter le support ?</h3>
        <p>
          Vous pouvez nous contacter par email à support@bingoo.com ou via le formulaire de contact disponible sur cette page.
        </p>

        <h2>Problèmes courants</h2>
        
        <h3>Je ne reçois pas l'email de vérification</h3>
        <p>
          Vérifiez votre dossier spam. Si vous ne trouvez toujours pas l'email, attendez quelques minutes et réessayez.
        </p>

        <h3>Je ne peux pas me connecter</h3>
        <p>
          Assurez-vous que votre email et votre mot de passe sont corrects. Si le problème persiste, essayez de réinitialiser votre mot de passe.
        </p>
      </div>
    </div>
  );
} 