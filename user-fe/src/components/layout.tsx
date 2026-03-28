import { Outlet } from "react-router-dom"
import Header from "./header"
import Footer from "./footer"
function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer></Footer>
    </>
  )
}

export default RootLayout