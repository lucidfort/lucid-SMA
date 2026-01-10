import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { defaultHome, routeAccessMap } from "./lib/settings";
import { RoleAccessLevel } from "./types";
//
// const matchers = Object.keys(routeAccessMap).map((route) => ({
//   matcher: createRouteMatcher([route]),
//   allowedRoles: routeAccessMap[route],
// }));

const matchers = Object.entries(routeAccessMap)
  .map(([route, allowedRoles]) => ({
    route,
    matcher: createRouteMatcher([route]),
    allowedRoles,
  }))
  .sort((a, b) => b.route.length - a.route.length);

export default clerkMiddleware(async (auth, req) => {
  if (
    req.nextUrl.pathname.startsWith("/auth") ||
    req.nextUrl.pathname.startsWith("/api/graphql")
  ) {
    return NextResponse.next();
  }

  const { userId, sessionClaims } = await auth();

  const accessLevel = (
    sessionClaims?.metadata as { accessLevel?: RoleAccessLevel }
  )?.accessLevel;

  const matched = matchers.find(({ matcher }) => matcher(req));

  if (!matched) {
    return NextResponse.next();
  }

  const { allowedRoles } = matched;

  // Not logged in → let page decide (sign-in, onboarding, etc.)
  if (!userId) {
    return NextResponse.next();
  }

  // Logged in but missing role metadata
  if (!accessLevel) {
    return NextResponse.redirect(new URL("/auth/sign-in", req.url));
  }

  if (!allowedRoles.includes(accessLevel)) {
    const home = defaultHome[accessLevel];

    if (!home) {
      throw new Error(`No defaultHome defined for role: ${accessLevel}`);
    }

    return NextResponse.redirect(new URL(home, req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/auth/:path*",
    "/admin",
    "/parent",
    "/teacher",
    "/list/:path*",
    "/finance/:path*",
    // Always run for API routes
    "/api(.*)",
  ],
};
