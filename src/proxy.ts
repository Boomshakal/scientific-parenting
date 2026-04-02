import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin)
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.href)
    return Response.redirect(loginUrl)
  }
})

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
}
