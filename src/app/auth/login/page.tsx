import { Metadata } from 'next';
import Image from 'next/image';
import { LoginForm } from '@/components/login-form';

export const metadata: Metadata = {
  title: 'Connexion - Bingoo',
  description: 'Connectez-vous à votre compte Bingoo',
};

export default function LoginPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src="/images/backgrounds/login-bg.jpg"
            alt="Background"
            className="object-cover opacity-50"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="relative z-20 flex items-center text-lg font-medium">
          <Image
            src="/images/logos/logo-bingoo.png"
            alt="Bingoo"
            width={120}
            height={32}
            priority
            className="h-8 w-auto"
          />
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;Découvrez l&apos;excitation du jeu responsable avec Bingoo. Des lots exceptionnels vous attendent !&rdquo;
            </p>
            <footer className="text-sm">Julie R.</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Connexion à votre compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Entrez vos identifiants pour accéder à votre compte
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
