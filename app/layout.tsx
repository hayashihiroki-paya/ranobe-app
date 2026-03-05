// app\layout.tsx
import Header from "@/components/Header"
import Providers from "@/components/Providers"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>

        <Providers>
          <Header />
          {children}
        </Providers>

      </body>
    </html>
  )
}