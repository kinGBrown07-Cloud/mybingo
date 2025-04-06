import { Metadata } from 'next';
import Image from 'next/image';
import { Suspense } from 'react';
import { RegistrationForm } from '@/components/registration-form';

export const metadata: Metadata = {
  title: 'Inscription - Bingoo',
  description: 'Créez votre compte Bingoo et commencez à jouer',
};

export default function RegisterPage() {
  return (
    <div className="container relative min-h-screen flex-col items-center justify-center grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src="/images/backgrounds/register-bg.jpg"
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
              &ldquo;Rejoignez notre communauté de joueurs et tentez de gagner des lots exceptionnels. Inscription simple et rapide !&rdquo;
            </p>
            <footer className="text-sm">Marc D.</footer>
          </blockquote>
        </div>
      </div>
      <div className="lg:p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[450px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Créer un compte
            </h1>
            <p className="text-sm text-muted-foreground">
              Remplissez le formulaire ci-dessous pour créer votre compte
            </p>
          </div>
          <Suspense fallback={<div>Loading...</div>}>
            <RegistrationForm />
          </Suspense>
          <p className="px-8 text-center text-sm text-muted-foreground">
            En créant un compte, vous acceptez nos{" "}
            <a href="/terms" className="underline underline-offset-4 hover:text-primary">
              conditions d&apos;utilisation
            </a>
            {" "}et notre{" "}
            <a href="/privacy" className="underline underline-offset-4 hover:text-primary">
              politique de confidentialité
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
