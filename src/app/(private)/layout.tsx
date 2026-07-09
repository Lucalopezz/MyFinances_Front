import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/serverAuth";
import { AuthProvider } from "@/providers/auth-provider";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();

  return (
    <AuthProvider>
      <AppShell>{children}</AppShell>
    </AuthProvider>
  );
}
