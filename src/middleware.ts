import { withAuth } from "next-auth/middleware";

export default withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      // paginas públicas que não requerem autenticação
      const publicPaths = ["/login", "/register"];

      // verifica se a rota atual é uma rota pública
      if (publicPaths.includes(req.nextUrl.pathname)) {
        return true; // permite acesso sem autenticação
      }

      // para todas as outras rotas, verifica se o usuário está autenticado
      return !!token;
    },
  },
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};