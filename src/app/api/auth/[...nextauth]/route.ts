import NextAuth, { User } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";


declare module "next-auth" {
  interface Session {
    jwt: string;
  }

  interface User {
    jwt: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    jwt: string;
  }
}

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const response = await fetch("http://backend:3001/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials?.email,
              password: credentials?.password,
            }),
          });

          const data = await response.json();

    
          if (response.ok && data.accessToken) {
            return {
              id: "1", 
              jwt: data.accessToken, 
            };
          }

   
          return null;
        } catch (error) {
          console.error("Erro na autenticação:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // Adiciona o token JWT ao token do NextAuth
      if (user) {
        token.jwt = user.jwt;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      // Adiciona o token JWT à sessão
      session.jwt = token.jwt;
      return session;
    },
  },
  pages: {
    signIn: "/login", 
    signOut: "/login", 
  },
  secret: process.env.NEXTAUTH_SECRET, 
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };