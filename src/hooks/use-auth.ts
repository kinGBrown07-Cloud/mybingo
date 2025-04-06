import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, LoginData, RegisterData, User, Profile } from '@/types/auth';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    isLoading: false,
    error: null
  });

  const login = useCallback(async (data: LoginData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Une erreur est survenue lors de la connexion'
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        user: result.user,
        profile: result.profile,
        isLoading: false,
        error: null
      }));

      router.push('/dashboard');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Une erreur est survenue lors de la connexion'
      }));
    }
  }, [router]);

  const register = useCallback(async (data: RegisterData) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (!response.ok) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Une erreur est survenue lors de l\'inscription'
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));

      router.push('/verify-email');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Une erreur est survenue lors de l\'inscription'
      }));
    }
  }, [router]);

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST'
      });

      if (!response.ok) {
        const result = await response.json();
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Une erreur est survenue lors de la déconnexion'
        }));
        return;
      }

      setState({
        user: null,
        profile: null,
        isLoading: false,
        error: null
      });

      router.push('/login');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Une erreur est survenue lors de la déconnexion'
      }));
    }
  }, [router]);

  const resetPassword = useCallback(async (email: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: !response.ok ? (result.error || 'Une erreur est survenue') : null
      }));

      if (response.ok) {
        router.push('/login?reset=requested');
      }
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Une erreur est survenue lors de la demande de réinitialisation'
      }));
    }
  }, [router]);

  const confirmResetPassword = useCallback(async (token: string, newPassword: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const response = await fetch('/api/auth/reset-password/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      });

      const result = await response.json();

      if (!response.ok) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error || 'Une erreur est survenue'
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null
      }));

      router.push('/login?reset=success');
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Une erreur est survenue lors de la réinitialisation du mot de passe'
      }));
    }
  }, [router]);

  return {
    user: state.user,
    profile: state.profile,
    isLoading: state.isLoading,
    error: state.error,
    login,
    register,
    logout,
    resetPassword,
    confirmResetPassword
  };
}
