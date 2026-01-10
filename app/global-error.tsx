"use client";

import { Button } from "@/components/ui/button";
import { AlertCircle, Home, Mail, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error);
  }, [error]);

  return (
    <div className="from-background via-background relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br to-blue-50/30 p-4">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 h-72 w-72 animate-pulse rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute right-10 bottom-20 h-96 w-96 animate-pulse rounded-full bg-purple-500/5 blur-3xl delay-700" />
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-gradient-to-br from-blue-500/3 to-purple-500/3 blur-3xl delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Error Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-red-500/20 blur-2xl" />
            <div className="relative rounded-full bg-white p-6 shadow-2xl">
              <AlertCircle
                className="h-20 w-20 text-red-500"
                strokeWidth={1.5}
              />
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="rounded-3xl border border-gray-100 bg-white/80 p-8 shadow-2xl backdrop-blur-xl md:p-12">
          <div className="mb-8 text-center">
            <h1 className="mb-4 text-4xl font-bold text-balance text-gray-900 md:text-5xl">
              Something Went Wrong
            </h1>
            <p className="mb-2 text-lg text-pretty text-gray-600">
              We encountered an unexpected error while processing your request.
            </p>
            <p className="text-sm text-pretty text-gray-500">
              Don&apos;t worry, our team has been notified and we&apos;re
              working on it.
            </p>
          </div>

          {/* Error Details */}
          {error.digest && (
            <div className="mb-8 rounded-xl border border-red-100 bg-red-50 p-4">
              <p className="font-mono text-xs text-red-600">
                <span className="font-semibold">Error ID:</span> {error.digest}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-8 flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={reset}
              size="lg"
              className="min-h-10 flex-1 bg-blue-600 text-white shadow-lg shadow-blue-500/30 transition-all duration-300 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/40"
            >
              <RefreshCw className="mr-2 h-5 w-5" />
              Try Again
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="min-h-10 flex-1 border-2 transition-all duration-300 hover:bg-gray-50"
            >
              <Link href="/" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 pt-6">
            <p className="mb-4 text-center text-sm text-gray-600">
              Need immediate assistance?
            </p>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                onClick={() =>
                  (window.location.href = "mailto:support@schoolmanager.com")
                }
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="mt-8 text-center text-sm text-gray-500">
          Eduvia • We&apos;re here to help you get back on track
        </p>
      </div>
    </div>
  );
}
