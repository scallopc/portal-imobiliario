import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/common/header'
import Footer from '@/components/common/footer'
import JadeChat from '@/components/common/jade-chat/jade-chat'
import ReactQueryProvider from '@/app/providers/react-query-provider'



export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Italiana&family=Lato:wght@300;400;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ReactQueryProvider>
          <Header />
          <div>
            {children}
          </div>
          <Footer />
          <JadeChat />
        </ReactQueryProvider>
      </body>
    </html>
  )
}
