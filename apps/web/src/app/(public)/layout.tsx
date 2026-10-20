import { PublicHeader } from "@/components/header/public-header";
import { getServerToken } from "@/lib/serverAuth";
import { isJwtExpired } from "@/lib/jwt";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getServerToken();
  const isAuthenticated = Boolean(token && !isJwtExpired(token));

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader isAuthenticated={isAuthenticated} />

      <main className="flex flex-1 bg-white dark:bg-gray-700">
        {children}
      </main>
    </div>
  );
}
