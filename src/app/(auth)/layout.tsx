import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "育娃记录 - 登录",
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="min-h-screen bg-[#fef7f0]">
      {children}
    </div>
  )
}
