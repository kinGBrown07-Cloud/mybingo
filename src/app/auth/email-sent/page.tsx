'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/layouts/auth-layout';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase-client';
import { Icons } from '@/components/ui/icons';

// Composant qui utilise useSearchParams
function EmailSentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams?.get('email') || '';
  const [countdown, setCountdown] = useState(60);
  const [resendDisabled, setResendDisabled] = useState(true);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      // Si pas d'email, rediriger vers la page d'inscription
      router.push('/auth/register');
    }
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0 && resendDisabled) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && resendDisabled) {
      setResendDisabled(false);
    }
  }, [countdown, resendDisabled]);

  const handleResendEmail = async () => {
    if (resendDisabled) return;

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        console.error('Erreur lors du renvoi de l\'email:', error);
        return;
      }

      setResendSuccess(true);
      setResendDisabled(true);
      setCountdown(60);
    } catch (error) {
      console.error('Erreur inattendue:', error);
    }
  };

  return (
    <>
      <div className="w-full max-w-md mx-auto text-center">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Vérifiez votre email</h2>
          <p className="text-white/80 mt-2">
            Nous avons envoyé un email de vérification à{' '}
            <span className="font-semibold">{email}</span>
          </p>
          <p className="text-purple-400 font-medium mt-2">
            Votre compte a été créé avec succès, mais vous devez vérifier votre email avant de pouvoir vous connecter.
          </p>
        </div>

        <div className="bg-white/10 rounded-lg p-6 mb-6">
          <div className="mb-4 flex justify-center">
            <div className="inline-flex h-24 w-24 items-center justify-center rounded-full bg-purple-100/20">
              <Icons.star className="h-12 w-12 text-purple-400" />
            </div>
          </div>
          
          <div className="text-white space-y-4">
            <p>
              <strong>Pour compléter votre inscription</strong>, veuillez vérifier votre adresse email en cliquant sur le lien que nous vous avons envoyé.
            </p>
            <ol className="list-decimal list-inside text-left space-y-2 pl-2">
              <li>Ouvrez votre boîte de réception email</li>
              <li>Recherchez un email de <strong>Bingoo</strong></li>
              <li>Cliquez sur le bouton ou lien de confirmation</li>
              <li>Vous serez redirigé vers la page de connexion</li>
            </ol>
            <p className="text-sm opacity-80 mt-4">
              Si vous ne trouvez pas l'email, vérifiez votre dossier de spam ou de promotions. L'email devrait arriver dans les 5 minutes.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleResendEmail}
            disabled={resendDisabled}
            variant="outline"
            className="w-full border-white/20 text-white hover:bg-white/10"
          >
            {resendDisabled
              ? `Renvoyer l'email (${countdown}s)`
              : "Renvoyer l'email de vérification"}
          </Button>

          {resendSuccess && (
            <p className="text-green-400 text-sm">
              Email de vérification renvoyé avec succès !
            </p>
          )}

          <div className="text-sm text-white/70">
            <p>
              Déjà vérifié votre email ?{' '}
              <Link href="/auth/login" className="text-purple-400 hover:text-purple-300 hover:underline">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// Page principale avec Suspense
export default function EmailSentPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
          <h2 className="text-2xl font-bold">Chargement...</h2>
        </div>
      }>
        <EmailSentContent />
      </Suspense>
    </AuthLayout>
  );
}
