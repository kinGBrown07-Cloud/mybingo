import { DefaultSession, DefaultUser } from "next-auth";
import { Profile, UserRole } from "@prisma/client";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role: UserRole;
      profile: {
        id: string;
        userId: string;
        username: string;
        firstName: string;
        lastName: string;
        phoneNumber: string | null;
        country: string;
        points: number;
        vipLevel: number;
        isVip: boolean;
        imageUrl: string | null;
        photoUrl: string | null;
        vipLevelId: string | null;
        referrerId: string | null;
        termsAccepted: boolean;
        termsAcceptedAt: Date;
        referralCode: string | null;
        birthdate: Date | null;
        region: string;
        currency: string;
        pointsRate: number;
        createdAt: Date;
        updatedAt: Date;
      } | null;
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string;
    role: UserRole;
    profile: {
      id: string;
      userId: string;
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber: string | null;
      country: string;
      points: number;
      vipLevel: number;
      isVip: boolean;
      imageUrl: string | null;
      photoUrl: string | null;
      vipLevelId: string | null;
      referrerId: string | null;
      termsAccepted: boolean;
      termsAcceptedAt: Date;
      referralCode: string | null;
      birthdate: Date | null;
      region: string;
      currency: string;
      pointsRate: number;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    profile: {
      id: string;
      userId: string;
      username: string;
      firstName: string;
      lastName: string;
      phoneNumber: string | null;
      country: string;
      points: number;
      vipLevel: number;
      isVip: boolean;
      imageUrl: string | null;
      photoUrl: string | null;
      vipLevelId: string | null;
      referrerId: string | null;
      termsAccepted: boolean;
      termsAcceptedAt: Date;
      referralCode: string | null;
      birthdate: Date | null;
      region: string;
      currency: string;
      pointsRate: number;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser extends DefaultUser {
    id: string;
    role: UserRole;
    profile: Profile | null;
  }
}
