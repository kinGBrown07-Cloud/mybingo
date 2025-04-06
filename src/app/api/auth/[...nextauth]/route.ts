import NextAuth, { AuthOptions, Session, User as AuthUser } from "next-auth";
import { prisma } from "@/lib/db";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<AuthUser | null> {
        try {
          if (!credentials?.email || !credentials?.password) {
            console.log("Missing credentials");
            return null;
          }

          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { profile: true }
          });

          if (!user) {
            console.log("User not found");
            return null;
          }

          if (!user.isActive) {
            console.log("User not active");
            throw new Error('Veuillez vérifier votre email pour activer votre compte');
          }

          if (!user.hashedPassword) {
            console.log("No password set");
            throw new Error('Méthode de connexion invalide');
          }

          const isValid = await compare(credentials.password, user.hashedPassword);

          if (!isValid) {
            console.log("Invalid password");
            return null;
          }

          // Update lastLoginAt
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
          });

          const fullName = user.profile ? `${user.profile.firstName} ${user.profile.lastName}`.trim() : null;

          const authUser = {
            id: user.id,
            email: user.email,
            role: user.role,
            profile: user.profile,
            name: fullName,
            image: null
          };

          console.log("Auth successful, returning user:", authUser);
          return authUser;
        } catch (error) {
          console.error("Auth error:", error);
          throw error;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log("JWT callback - user:", user);
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.profile = user.profile;
      }
      return token;
    },
    async session({ session, token }): Promise<Session> {
      console.log("Session callback - token:", token);
      return {
        ...session,
        user: {
          ...session.user,
          id: token.id,
          email: token.email,
          role: token.role,
          profile: token.profile,
          name: token.name ?? null,
          image: token.image ?? null
        }
      };
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  debug: true, // Enable debug mode for more detailed logs
  callbacks: {
    async redirect({ url, baseUrl }) {
      // Allow callbacks to both production and development URLs
      const allowedCallbacks = [
        'https://lucky-bingoo.vercel.app',
        'https://www.mybingo.reussirafrique.com',
        baseUrl
      ];
      if (allowedCallbacks.some(callback => url.startsWith(callback))) {
        return url;
      }
      return baseUrl;
    }
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
