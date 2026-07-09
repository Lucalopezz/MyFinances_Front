import { PublicHeader } from "@/components/header/public-header";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />

      <main className="flex flex-1 bg-white p-4 dark:bg-gray-700 md:p-6">
        {children}
      </main>
    </div>
  );
}
