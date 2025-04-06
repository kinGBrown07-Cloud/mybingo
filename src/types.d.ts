import { DefaultSession } from 'next-auth';
import { Profile, Region, UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      role: UserRole;
      profile: Profile | null;
      region?: Region;
      name?: string | null;
      image?: string | null;
    } & Omit<DefaultSession['user'], 'email'>
  }

  interface User {
    id: string;
    email: string;
    role: UserRole;
    profile: Profile | null;
    region?: Region;
    name?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: UserRole;
    profile: Profile | null;
    region?: Region;
    name?: string | null;
    image?: string | null;
  }
}
