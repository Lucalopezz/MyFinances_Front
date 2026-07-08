import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers/app-providers";
import { AppShell } from "@/components/layout/app-shell";
import { cookies } from "next/headers";
import { AUTH_COOKIE_NAME } from "@/lib/backend";

export const metadata: Metadata = {
  title: "MyFinances",
  description: "Organize suas finanças",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialJwt = (await cookies()).get(AUTH_COOKIE_NAME)?.value ?? null;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen antialiased")}>
        <AppProviders initialJwt={initialJwt}>
          <AppShell>{children}</AppShell>
        </AppProviders>
      </body>
    </html>
  );
}
