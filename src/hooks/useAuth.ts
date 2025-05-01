'use client';

import { useState, useEffect } from 'react';
import { UserProfile } from '@/services/authService';
import { isAuthenticated, loginUser, logoutUser, registerUser, RegistrationData } from '@/services/authService';

interface AuthState {
  user: UserProfile | null;
  loading: boolean;
  error: string | null;
  success: string | null;
}

interface AuthResult {
  success: boolean;
  message?: string;
  user?: UserProfile;
  profile?: UserProfile;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    success: null
  });

  const clearMessages = () => {
    setState(prev => ({ ...prev, error: null, success: null }));
  };

  const setError = (error: string) => {
    setState(prev => ({ ...prev, error, success: null }));
    // Effacer le message d'erreur après 5 secondes
    setTimeout(clearMessages, 5000);
  };

  const setSuccess = (message: string) => {
    setState(prev => ({ ...prev, success: message, error: null }));
    // Effacer le message de succès après 3 secondes
    setTimeout(clearMessages, 3000);
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const result = await isAuthenticated();
        setState({
          user: result.profile || null,
          loading: false,
          error: null,
          success: null
        });
      } catch (error) {
        setState({
          user: null,
          loading: false,
          error: 'Erreur lors de la vérification de l\'authentification',
          success: null
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
        user: result.profile || null,
        loading: false,
        error: null,
        success: null
      });
      return result;
    } catch (error) {
      setState({
        user: null,
        loading: false,
        error: 'Erreur lors de la vérification de l\'authentification',
        success: null
      });
      return { success: false, profile: null };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await loginUser(email, password);
      
      if (result.success && result.profile) {
        setState(prev => ({ ...prev, user: result.profile!, loading: false }));
        setSuccess('Connexion réussie !');
      } else {
        setError(result.message || 'Erreur de connexion');
      }
    } catch (error) {
      setError('Une erreur est survenue lors de la connexion');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const register = async (data: RegistrationData) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await registerUser(data);
      
      if (result.success && result.profile) {
        setState(prev => ({ ...prev, user: result.profile!, loading: false }));
        setSuccess('Inscription réussie !');
      } else {
        setError(result.message || 'Erreur lors de l\'inscription');
      }
    } catch (error) {
      setError('Une erreur est survenue lors de l\'inscription');
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  const logout = async () => {
    setState(prev => ({ ...prev, loading: true }));

    try {
      await logoutUser();
      setState({
        user: null,
        loading: false,
        error: null,
        success: null
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
    ...state,
    signIn: login,
    signUp: register,
    signOut: logout,
    checkAuth,
    clearMessages
  };
};
