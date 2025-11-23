import { Toaster } from "@/components/ui/sonner";
import { UrqlProvider } from "@/lib/urql/provider";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

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
          <body className={`${inter.className} antialiased`}>
            <UrqlProvider>
              {children}
              <Toaster />
            </UrqlProvider>
          </body>
        </html>
      </ClerkProvider>
    </>
  );
}
