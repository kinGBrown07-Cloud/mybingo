import { NextAuthOptions, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import GoogleProvider from 'next-auth/providers/google';
import { UserRole as PrismaUserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name: string | null;
      email: string | null;
      image: string | null;
      photoId: string | null;
      role: PrismaUserRole;
    }
  }

  interface User {
    id: string;
    email: string | null;
    name?: string | null;
    role: PrismaUserRole;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string | null;
    name?: string | null;
    picture: string | null;
    photoId: string | null;
    role: PrismaUserRole;
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async session({ token, session }): Promise<Session> {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name || null;
        session.user.email = token.email || null;
        session.user.image = token.picture || null;
        session.user.photoId = token.photoId || null;
        session.user.role = token.role;
      }

      return session;
    },
    async jwt({ token, user }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      const dbUser = await prisma.user.findFirst({
        where: {
          email: token.email || undefined,
        },
        include: {
          profile: true,
        },
      });

      if (!dbUser) {
        return token;
      }

      token.id = dbUser.id;
      token.picture = dbUser.profile?.imageUrl || null;
      token.photoId = dbUser.profile?.photoUrl || null;
      token.role = dbUser.role;

      return token;
    },
  },
};
