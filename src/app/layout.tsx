import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "next-themes";
import { Providers } from "@/providers/layout-provider";

export const metadata: Metadata = {
  title: "MyFinances",
  description: "Organize suas finanças",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen antialiased")}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
