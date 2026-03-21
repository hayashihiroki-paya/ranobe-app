// app/layout.tsx
import Header from "@/components/Header"
import Providers from "@/components/Providers"
import "./globals.css"
import LikeInitializer from "@/features/like/components/LikeInitializer"
import TagModalRoot from "@/features/tag/components/TagModalRoot"
import { Toaster } from "sonner" // 👈 追加

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>

        <Providers>

          <LikeInitializer />

          <Header />
          {children}

          {/* 👇 ここに追加（重要） */}
          <Toaster richColors position="top-center" />

        </Providers>

        <TagModalRoot />

      </body>
    </html>
  )
}