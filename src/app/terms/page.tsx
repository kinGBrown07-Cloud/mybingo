import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Conditions d\'utilisation - Bingoo',
  description: 'Conditions d\'utilisation de Bingoo',
};

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Conditions d'utilisation</h1>
      <div className="prose prose-invert max-w-none">
        <h2>1. Acceptation des conditions</h2>
        <p>
          En accédant et en utilisant ce site web, vous acceptez d'être lié par les présentes conditions d'utilisation.
        </p>

        <h2>2. Utilisation du service</h2>
        <p>
          Vous devez être âgé d'au moins 18 ans pour utiliser ce service. Vous êtes responsable de maintenir la confidentialité de votre compte et de votre mot de passe.
        </p>

        <h2>3. Comportement des utilisateurs</h2>
        <p>
          Vous vous engagez à ne pas utiliser le service de manière abusive ou frauduleuse. Tout comportement contraire aux règles peut entraîner la suspension ou la fermeture de votre compte.
        </p>

        <h2>4. Propriété intellectuelle</h2>
        <p>
          Tout le contenu du site est protégé par les lois sur la propriété intellectuelle. Vous ne pouvez pas copier, modifier ou distribuer le contenu sans autorisation.
        </p>

        <h2>5. Limitation de responsabilité</h2>
        <p>
          Nous ne sommes pas responsables des dommages directs ou indirects résultant de l'utilisation de notre service.
        </p>

        <h2>6. Modification des conditions</h2>
        <p>
          Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications prendront effet dès leur publication sur le site.
        </p>
      </div>
    </div>
  );
} 