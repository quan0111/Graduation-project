import { Outlet } from "react-router-dom"
import Header from "./header"
import Footer from "./footer"
import { ChatbotWidget } from "@/modules/chatbot/components/chatbot-widget"

function RootLayout() {
  return (
    <>
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
