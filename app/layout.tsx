// app/layout.tsx
import Header from "@/components/Header"
import Providers from "@/components/Providers"
import "./globals.css"
import LikeInitializer from "@/features/like/components/LikeInitializer"
import TagModalRoot from "@/features/tag/components/TagModalRoot"
import { Toaster } from "sonner"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions);
  return (
    <html lang="ja">
      <body>

        <Providers>

          <LikeInitializer />

          <Header />
          {children}

          <Toaster richColors position="top-center" />

          <TagModalRoot />

        </Providers>

      </body>
    </html>
  )
}