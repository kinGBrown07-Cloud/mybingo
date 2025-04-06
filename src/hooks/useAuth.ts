'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/services/authService';
import { isAuthenticated, loginUser, logoutUser, registerUser, RegistrationData } from '@/services/authService';

interface AuthState {
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    profile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await isAuthenticated();
        setState({
          profile: result.profile || null,
          loading: false,
          error: null
        });
      } catch (error) {
        setState({
          profile: null,
          loading: false,
          error: 'Erreur lors de la vérification de l\'authentification'
        });
      }
    };

    initAuth();
  }, []);

  const checkAuth = async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const result = await isAuthenticated();
      setState({
        profile: result.profile || null,
        loading: false,
        error: null
      });
      return result;
    } catch (error) {
      setState({
        profile: null,
        loading: false,
        error: 'Erreur lors de la vérification de l\'authentification'
      });
      return { success: false, profile: null };
    }
  };

  const login = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await loginUser(email, password);

      if (!result.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message
        }));
        return;
      }

      setState({
        profile: result.profile || null,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        profile: null,
        loading: false,
        error: 'Erreur lors de la connexion'
      });
    }
  };

  const register = async (data: RegistrationData) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await registerUser(data);

      if (!result.success) {
        setState(prev => ({
          ...prev,
          loading: false,
          error: result.message
        }));
        return;
      }

      setState({
        profile: result.profile || null,
        loading: false,
        error: null
      });
    } catch (error) {
      setState({
        profile: null,
        loading: false,
        error: 'Erreur lors de l\'inscription'
      });
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      await logoutUser();
      setState({
        profile: null,
        loading: false,
        error: null
      });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Erreur lors de la déconnexion'
      }));
    }
  };

  return {
    profile: state.profile,
    loading: state.loading,
    error: state.error,
    signIn: login,
    signUp: register,
    signOut: logout,
    checkAuth
  };
}
