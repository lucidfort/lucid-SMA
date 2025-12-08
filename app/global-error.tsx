"use client"

import { Button } from "@/components/ui/button"
import { AlertCircle, Home, Mail, RefreshCw } from "lucide-react"
import Link from "next/link"
import { useEffect } from "react"
import "./globals.css"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error:", error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-blue-50/30 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/3 to-purple-500/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="max-w-2xl w-full relative z-10">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 rounded-full blur-2xl animate-pulse" />
            <div className="relative bg-white rounded-full p-6 shadow-2xl">
              <AlertCircle className="w-20 h-20 text-red-500" strokeWidth={1.5} />
            </div>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-100 p-8 md:p-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 text-balance">Something Went Wrong</h1>
            <p className="text-lg text-gray-600 mb-2 text-pretty">
              We encountered an unexpected error while processing your request.
            </p>
            <p className="text-sm text-gray-500 text-pretty">
              Don&apos;t worry, our team has been notified and we&apos;re working on it.
            </p>
          </div>

          {/* Error Details */}
          {error.digest && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-8">
              <p className="text-xs text-red-600 font-mono">
                <span className="font-semibold">Error ID:</span> {error.digest}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              onClick={reset}
              size="lg"
              className="flex-1 min-h-10 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all duration-300"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              Try Again
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 min-h-10 border-2 hover:bg-gray-50 transition-all duration-300"
            >
              <Link href="/" className="flex gap-2 items-center">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
          </div>

          {/* Help Section */}
          <div className="border-t border-gray-200 pt-6">
            <p className="text-center text-sm text-gray-600 mb-4">Need immediate assistance?</p>
            <div className="flex justify-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => (window.location.href = "mailto:support@schoolmanager.com")}
              >
                <Mail className="w-4 h-4 mr-2" />
                Contact Support
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-sm text-gray-500 mt-8">
          Learnix • We&apos;re here to help you get back on track
        </p>
      </div>
    </div>
  )
}
