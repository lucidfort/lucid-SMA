import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/server/utils"
import { defaultHome } from "@/lib/settings"
import { Home } from "lucide-react"
import Link from "next/link"

export default async function NotFound() {
    const { accessLevel } = await getCurrentUser()

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 flex items-center justify-center p-4">
            <div className="max-w-5xl w-full">
                <div className="text-center space-y-8">
                    {/* Animated 404 */}
                    <div className="relative">
                        <div className="text-[180px] md:text-[280px] font-bold leading-none tracking-tight">
                            <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                                4
                            </span>
                            <span className="relative inline-block">
                                <span className="bg-gradient-to-br from-blue-600 via-blue-500 to-blue-600 bg-clip-text text-transparent animate-pulse">
                                    0
                                </span>
                                <div className="absolute inset-0 blur-3xl bg-blue-500/20 animate-pulse" />
                            </span>
                            <span className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 bg-clip-text text-transparent">
                                4
                            </span>
                        </div>

                        {/* Floating elements */}
                        <div
                            className="absolute top-1/2 left-1/4 -translate-y-1/2 w-16 h-16 rounded-full bg-blue-100 blur-2xl animate-bounce"
                            style={{ animationDelay: "0s", animationDuration: "3s" }}
                        />
                        <div
                            className="absolute top-1/3 right-1/4 w-12 h-12 rounded-full bg-slate-100 blur-xl animate-bounce"
                            style={{ animationDelay: "1s", animationDuration: "4s" }}
                        />
                    </div>

                    {/* Message */}
                    <div className="space-y-4 px-4">
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 text-balance">Page Not Found</h1>
                        <p className="text-lg text-slate-600 max-w-2xl mx-auto text-pretty">
                            Looks like this page decided to skip class today. Don&apos;t worry, we&apos;ll help you get back on track.
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4">
                        <Button
                            asChild
                            size="lg"
                            className="min-w-[160px] shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                        >
                            <Link href={defaultHome[accessLevel!]}>
                                <Home className="mr-2 h-4 w-4" />
                                Go Home
                            </Link>
                        </Button>
                    </div>

                    {/* Help text */}
                    <div className="pt-8 px-4">
                        <p className="text-sm text-slate-500">
                            Need help?{" "}
                            <Link
                                href="/support"
                                className="text-blue-600 hover:text-blue-700 font-medium underline underline-offset-4"
                            >
                                Contact Support
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
