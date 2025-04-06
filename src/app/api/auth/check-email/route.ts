import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return new NextResponse('Email is required', { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    return NextResponse.json({ exists: !!user });
  } catch (error) {
    console.error('Error checking email:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
