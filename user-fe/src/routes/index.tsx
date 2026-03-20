import { createBrowserRouter } from "react-router-dom"
import RootLayout from "../components/layout"
import Home from "../modules/home/view/index"
import LoginPage from "../modules/auth/view/LoginPage"
import SignupPage from "@/modules/auth/view/signupPage"
import { SellerRegistrationView } from "@/modules/shop/view/create"
import { SellerDashboardView } from "@/modules/shop/view/dashboard"
import { CartView } from "@/modules/cart/view"
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
      {
        path:"/seller",
        element:<SellerRegistrationView></SellerRegistrationView>
      },
            {
        path:"/dashboard",
        element:<SellerDashboardView></SellerDashboardView>
      },
      {
        path: "/cart",
        element: <CartView></CartView>,
      },
      
])
