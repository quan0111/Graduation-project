import { useLayoutEffect } from "react"
import { Outlet, useLocation } from "react-router-dom"
import Header from "./header"
import Footer from "./footer"
import { ChatbotWidget } from "@/modules/chatbot/components/chatbot-widget"

function ScrollToTop() {
  const { pathname, hash } = useLocation()

  useLayoutEffect(() => {
    if (hash) return
    window.scrollTo({ top: 0, left: 0, behavior: "auto" })
  }, [pathname, hash])

  return null
}

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <main>
        <Outlet />
      </main>
      <ChatbotWidget />
      <Footer></Footer>
    </>
  )
}

export default RootLayout
