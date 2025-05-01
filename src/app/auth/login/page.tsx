'use client';

import { LoginForm } from '@/components/login-form';
import AuthLayout from '@/components/layouts/auth-layout';
import { Suspense } from 'react';

export default function LoginPage() {
  return (
    <AuthLayout>
      <Suspense fallback={<div>Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
