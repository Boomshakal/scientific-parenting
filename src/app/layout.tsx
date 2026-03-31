import type { Metadata } from "next";
import "./globals.css";
import { Header, BottomNav } from "@/components/layout/Header";
import { ToastContainer } from "@/components/ui/Toast";
import { SessionProvider } from "@/components/providers/SessionProvider";

export const metadata: Metadata = {
  title: "育娃记录 - 记录成长每一刻",
  description: "科学育娃记录应用，记录宝宝的生长发育、饮食、睡眠、里程碑等重要时刻",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fef7f0]">
        <SessionProvider>
          <Header />
          <main className="flex-1 pb-24 md:pb-8">
            <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
              {children}
            </div>
          </main>
          <BottomNav />
          <ToastContainer />
        </SessionProvider>
      </body>
    </html>
  );
}
