import { Toaster } from "@/components/ui/sonner";
import { UrqlProvider } from "@/lib/urql/urql.provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import localFonts from "next/font/local";
import { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";

import "./globals.css";

const fonts = localFonts({
  src: [
    {
      path: "./fonts/GeistMono-Bold.woff2",
      weight: "700",
    },
    {
      path: "./fonts/GeistMono-Medium.woff2",
      weight: "500",
    },
    {
      path: "./fonts/GeistMono-Regular.woff2",
      weight: "400",
    },
    {
      path: "./fonts/GeistMono-ExtraLight.woff2",
      weight: "200",
    },
  ],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "School Management Application",
  description:
    "Comprehensive platform designed to streamline administrative tasks, manage student records, track attendance, and facilitate communication between teachers, students, and parents",
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <>
      <ClerkProvider>
        <html lang="en" suppressHydrationWarning>
          <body
            className={`${fonts.variable} w-full overflow-x-hidden antialiased`}
          >
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <UrqlProvider>
                {children}
                <Toaster />
              </UrqlProvider>
            </ThemeProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}
