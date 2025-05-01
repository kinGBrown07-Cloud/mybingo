'use client';

import { RegistrationForm } from '@/components/registration-form';
import AuthLayout from '@/components/layouts/auth-layout';
import { Suspense } from 'react';

export default function RegisterPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="h-8 w-8 animate-spin border-4 border-primary border-t-transparent rounded-full" />
          <h2 className="text-2xl font-bold">Chargement...</h2>
        </div>
      }>
        <RegistrationForm />
      </Suspense>
    </AuthLayout>
  );
}
