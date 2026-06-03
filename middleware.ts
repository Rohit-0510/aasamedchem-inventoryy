import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function middleware(request: any) {
  const session = await auth();

  // If no session, redirect to login unless already on login page or home
  if (!session) {
    if (!request.nextUrl.pathname.startsWith("/login")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }

  const userRole = (session.user as any)?.role;

  // Redirect to appropriate dashboard after successful login
  if (request.nextUrl.pathname === "/login") {
    const dashboardUrl =
      userRole === "ADMIN" ? "/admin/dashboard" : "/dashboard";
    return NextResponse.redirect(new URL(dashboardUrl, request.url));
  }

  // Admin routes protection
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Seller routes protection
  if (
    request.nextUrl.pathname.startsWith("/dashboard") ||
    request.nextUrl.pathname.startsWith("/products") ||
    request.nextUrl.pathname.startsWith("/orders")
  ) {
    if (userRole !== "SELLER") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
