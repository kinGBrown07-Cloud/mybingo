'use client';

import Cookies from 'js-cookie';

interface CookieOptions {
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  path?: string;
  expires?: number | Date;
}

export const cookieHelper = {
  set(name: string, value: string, options?: CookieOptions) {
    Cookies.set(name, value, options);
  },

  get(name: string): string | undefined {
    return Cookies.get(name);
  },

  delete(name: string) {
    Cookies.remove(name);
  },

  setAuthCookie(token: string) {
    this.set('auth-token', token, {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    });
  },

  getAuthCookie(): string | undefined {
    return this.get('auth-token');
  },

  removeAuthCookie() {
    this.delete('auth-token');
  }
};
