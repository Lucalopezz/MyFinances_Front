import { getCategories } from "@/actions/category/categories";
import { CategoryProvider } from "@/providers/category-provider";
import { AppShell } from "@/components/layout/app-shell";
import { requireAuth } from "@/lib/serverAuth";
import { AuthProvider } from "@/providers/auth-provider";

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  const categories = await getCategories().catch(() => undefined);

  return (
    <AuthProvider>
      <CategoryProvider initialData={categories}>
        <AppShell>{children}</AppShell>
      </CategoryProvider>
    </AuthProvider>
  );
}
