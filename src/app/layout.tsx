import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { AppProviders } from "@/providers/app-providers";

export const metadata: Metadata = {
  title: "MyFinances",
  description: "Organize suas finanças",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen antialiased")}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
