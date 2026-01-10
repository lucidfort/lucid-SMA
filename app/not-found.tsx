import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-4">
      <div className="w-full max-w-5xl">
        <div className="space-y-8 text-center">
          {/* Animated 404 */}
          <div className="relative">
            <div className="text-[180px] leading-none font-bold tracking-tight md:text-[280px]">
              <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                4
              </span>
              <span className="relative inline-block">
                <span className="animate-pulse bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent">
                  0
                </span>
                <div className="absolute inset-0 animate-pulse bg-blue-500/20 blur-3xl" />
              </span>
              <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                4
              </span>
            </div>

            {/* Floating elements */}
            <div
              className="absolute top-1/2 left-1/4 h-16 w-16 -translate-y-1/2 animate-bounce rounded-full bg-blue-100 blur-2xl"
              style={{ animationDelay: "0s", animationDuration: "3s" }}
            />
            <div
              className="absolute top-1/3 right-1/4 h-12 w-12 animate-bounce rounded-full bg-slate-100 blur-xl"
              style={{ animationDelay: "1s", animationDuration: "4s" }}
            />
          </div>

          {/* Message */}
          <div className="space-y-4 px-4">
            <h1 className="text-3xl font-bold text-balance text-slate-900 md:text-4xl">
              Page Not Found
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-pretty text-slate-600">
              Looks like this page decided to skip class today. Don&apos;t
              worry, we&apos;ll help you get back on track.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col items-center justify-center gap-3 px-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="min-w-[160px] shadow-lg shadow-blue-500/20 transition-all hover:shadow-xl hover:shadow-blue-500/30"
            >
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Help text */}
          <div className="px-4 pt-8">
            <p className="text-sm text-slate-500">
              Need help?{" "}
              <Link
                href="mailto:contact@eduvia.com"
                className="font-medium text-blue-600 underline underline-offset-4 hover:text-blue-700"
              >
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
