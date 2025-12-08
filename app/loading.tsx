"use client"

export default function Loading() {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-background via-blue-50/30 to-background">
            {/* Ambient floating shapes */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-[10%] top-[20%] h-32 w-32 animate-float rounded-full bg-blue-500/10 blur-3xl" />
                <div className="absolute right-[15%] top-[40%] h-40 w-40 animate-float-delayed rounded-full bg-primary/10 blur-3xl" />
                <div className="absolute bottom-[30%] left-[20%] h-36 w-36 animate-float-slow rounded-full bg-blue-400/10 blur-3xl" />
                <div className="absolute bottom-[20%] right-[25%] h-28 w-28 animate-float rounded-full bg-primary/15 blur-3xl" />
            </div>

            {/* Main loading content */}
            <div className="relative z-10 flex flex-col items-center gap-8 px-4 text-center">
                {/* Animated logo/spinner */}
                <div className="relative">
                    {/* Outer rotating ring */}
                    <div className="h-32 w-32 animate-spin rounded-full border-4 border-blue-200 border-t-primary" />

                    {/* Inner pulsing circle */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="h-20 w-20 animate-pulse rounded-full bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/50" />
                    </div>

                    {/* Center icon */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                        </svg>
                    </div>
                </div>

                {/* Loading text with gradient */}
                <div className="space-y-3">
                    <h2 className="bg-gradient-to-r from-primary via-blue-600 to-primary bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
                        Learnix
                    </h2>
                </div>

                {/* Animated loading dots */}
                <div className="flex gap-2">
                    <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
                    <div className="h-3 w-3 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
                    <div className="h-3 w-3 animate-bounce rounded-full bg-primary" />
                </div>
            </div>

            {/* Bottom decorative elements */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />

            {/* Custom animations */}
            <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-20px) scale(1.1); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.15); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.05); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 7s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
      `}</style>
        </div>
    )
}
