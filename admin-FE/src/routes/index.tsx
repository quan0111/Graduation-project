import { createBrowserRouter } from "react-router-dom"
import RootLayout from "../component/layout"
import Home from "../modules/home/view/index"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
])