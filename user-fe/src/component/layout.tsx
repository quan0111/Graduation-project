import { Outlet } from "react-router-dom"
import { Header } from "./header"

function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default RootLayout