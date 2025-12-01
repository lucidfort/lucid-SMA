import { Toaster } from "@/components/ui/sonner";
import { UrqlProvider } from "@/lib/urql/provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import localFonts from "next/font/local";
import { ReactNode } from "react";
import "./globals.css";
import { UserProvider } from "@/provider/user.provider";

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
  variable: "--font-geist-mono"
})

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
        <html lang="en">
          <body className={`${fonts.variable} antialiased`}>
            <UrqlProvider>
              {children}
              <Toaster />
              <UserProvider />
            </UrqlProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}
