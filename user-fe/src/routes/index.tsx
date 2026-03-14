import { createBrowserRouter } from "react-router-dom"
import RootLayout from "../components/layout"
import { AuthLayout } from "@/modules/auth/components/auth-layout"
import Home from "../modules/home/view/index"
import LoginPage from "../modules/auth/view/LoginPage"
import SignupPage from "@/modules/auth/view/signupPage"
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

      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <SignupPage />,
      },
])