import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db";
import { Prisma, Profile, Session, User, UserRole, VerificationToken } from "@prisma/client";
import { AdapterAccount } from "next-auth/adapters";

export interface CustomAdapterUser extends User {
  profile?: Profile | null;
}

export function CustomPrismaAdapter() {
  const adapter = PrismaAdapter(prisma);

  return {
    ...adapter,
    createUser: async (data: Prisma.UserCreateInput): Promise<CustomAdapterUser> => {
      const user = await prisma.user.create({
        data: {
          email: data.email,
          emailVerified: data.emailVerified,
          role: UserRole.USER,
          isActive: false,
        },
        include: {
          profile: true,
        },
      });
      return user;
    },

    getUser: async (id: string): Promise<CustomAdapterUser | null> => {
      const user = await prisma.user.findUnique({
        where: { id },
        include: {
          profile: true,
        },
      });
      return user;
    },

    getUserByEmail: async (email: string): Promise<CustomAdapterUser | null> => {
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          profile: true,
        },
      });
      return user;
    },

    updateUser: async (data: Partial<User>): Promise<CustomAdapterUser> => {
      const { id, ...userData } = data;
      if (!id) throw new Error("No user id provided");

      const user = await prisma.user.update({
        where: { id },
        data: userData,
        include: {
          profile: true,
        },
      });
      return user;
    },

    createSession: async (data: {
      sessionToken: string;
      userId: string;
      expires: Date;
    }): Promise<Session> => {
      const session = await prisma.session.create({
        data: {
          token: data.sessionToken,
          userId: data.userId,
          expires: data.expires,
          lastActivity: new Date(),
        },
      });
      return {
        ...session,
        sessionToken: session.token,
      } as Session;
    },

    getSessionAndUser: async (sessionToken: string): Promise<{
      session: Session;
      user: CustomAdapterUser;
    } | null> => {
      const userAndSession = await prisma.session.findUnique({
        where: { token: sessionToken },
        include: {
          user: {
            include: {
              profile: true,
            },
          },
        },
      });

      if (!userAndSession) return null;

      const { user, ...session } = userAndSession;
      return {
        session: {
          ...session,
          sessionToken: session.token,
        } as Session,
        user,
      };
    },

    updateSession: async (data: Partial<Session>): Promise<Session | null> => {
      const { sessionToken, ...sessionData } = data;
      if (!sessionToken) throw new Error("No session token provided");

      const session = await prisma.session.update({
        where: { token: sessionToken },
        data: {
          ...sessionData,
          lastActivity: new Date(),
        },
      });

      return {
        ...session,
        sessionToken: session.token,
      } as Session;
    },

    deleteSession: async (sessionToken: string): Promise<Session | null> => {
      const session = await prisma.session.delete({
        where: { token: sessionToken },
      });

      return {
        ...session,
        sessionToken: session.token,
      } as Session;
    },

    createVerificationToken: async (data: {
      identifier: string;
      token: string;
      expires: Date;
    }): Promise<VerificationToken> => {
      const verificationToken = await prisma.verificationToken.create({
        data: {
          identifier: data.identifier,
          token: data.token,
          expires: data.expires,
        },
      });
      return verificationToken;
    },

    useVerificationToken: async (params: {
      identifier: string;
      token: string;
    }): Promise<VerificationToken | null> => {
      try {
        const verificationToken = await prisma.verificationToken.delete({
          where: {
            token: params.token,
            identifier: params.identifier,
          },
        });
        return verificationToken;
      } catch {
        return null;
      }
    },
  };
}
