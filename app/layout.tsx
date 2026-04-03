// app/layout.tsx
import Header from "@/components/Header"
import Providers from "@/components/Providers"
import "./globals.css"
import LikeInitializer from "@/features/like/components/LikeInitializer"
import TagModalRoot from "@/features/tag/components/TagModalRoot"
import { Toaster } from "sonner"
import { getServerSession } from "next-auth"
import { authOptions } from "./api/auth/[...nextauth]/route"


export const metadata = {
  title: "ラノベならべ",
  description: "細かい好みに合わせて新しいラノベを見つけ出す",
  openGraph: {
    title: "ラノベならべ",
    description: "あなたの好きな要素からおすすめ作品を発見",
    images: ["/ogp.png"],
  },
  twitter: {
    card: "summary_large_image",
  },
};

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