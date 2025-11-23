import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { defaultHome, routeAccessMap } from "./lib/settings";
import { RoleAccessLevel } from "./types";

const matchers = Object.keys(routeAccessMap).map((route) => ({
  matcher: createRouteMatcher([route]),
  allowedRoles: routeAccessMap[route],
}));

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();

  const accessLevel = (
    sessionClaims?.metadata as { accessLevel?: RoleAccessLevel }
  )?.accessLevel;

  if (req.nextUrl.pathname.startsWith("/api/graphql")) {
    const isOnboarding = req.headers.get("x-onboarding") === "true";

    if (!userId && !isOnboarding) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.next();
  }

  for (const { matcher, allowedRoles } of matchers) {
    if (matcher(req) && !allowedRoles.includes(accessLevel!)) {
      return NextResponse.redirect(new URL(defaultHome[accessLevel!], req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/api(.*)",
  ],
};
