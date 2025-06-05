// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user, account }) {
            if (account?.provider === 'google') {
                try {
                    const existingUser = await prisma.user.findUnique({
                        where: { email: user.email! },
                    });

                    if (!existingUser) {
                        await prisma.user.create({
                            data: {
                                email: user.email!,
                                name: user.name || '',
                            },
                        });
                    }
                    return true;
                } catch (error) {
                    console.error('Error creating user:', error);
                    return false;
                }
            }
            return true;
        },
        async session({ session }) {
            if (session.user?.email) {
                // Get user from your database
                const dbUser = await prisma.user.findUnique({
                    where: { email: session.user.email },
                });
                if (dbUser) {
                    session.user.id = dbUser.id;
                }
            }
            return session;
        },
        async jwt({ token }) {
            return token;
        },
    },
    session: {
        strategy: 'jwt',
    },
});

export { handler as GET, handler as POST };
