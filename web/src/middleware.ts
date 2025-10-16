import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api/auth/callback/google")) {
    const url = request.nextUrl.clone();
    // Check if mobile browser user agent
    const userAgent = request.headers.get("user-agent") ?? "";

    // If mobile browser, redirect to mobile app
    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) &&
      !url.searchParams.has("mobile")
    ) {
      url.searchParams.set("mobile", "1");
      return NextResponse.redirect("nextguard://?" + url.searchParams.toString());
    } else {
      url.searchParams.delete("mobile");
      
      return NextResponse.rewrite(url);
    }
  }

  const headers = new Headers(request.headers);
  headers.set("x-href", request.nextUrl.href);

  return NextResponse.next({ headers });
}

export const config = {
  matcher: [
    "/api/auth/callback/google",
    "/((?!api|_next/static|_next/image|favicon.ico).*)"
  ],
};
