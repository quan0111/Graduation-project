import { createBrowserRouter } from "react-router-dom"
import RootLayout from "@/components/layout"
import DashboardPage from "@/modules/home/view"
import SettingsPage from "@/modules/setting/view"
import UsersPage from "@/modules/user/view"
import SupportPage from "@/modules/support/view"
import TransactionsPage from "@/modules/transaction/view"
import ShopsPage from "@/modules/shop/view"
import ReviewsPage from "@/modules/review/view"
import PromotionsPage from "@/modules/promotions/view"
import ProductsPage from "@/modules/products/view"
import OrdersPage from "@/modules/orders/view"
import CategoriesPage from "@/modules/categories/view"
import AnalyticsPage from "@/modules/analytics/view"

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
      {
        path: "users",
        element: <UsersPage />,
      },
      {
        path: "support",
        element: <SupportPage />,
      },
      {
        path: "transactions",
        element: <TransactionsPage />,
      },
      {
        path: "shops",
        element: <ShopsPage />,
      },
      {
        path: "reviews",
        element: <ReviewsPage />,
      },
      {
        path: "promotions",
        element: <PromotionsPage />,
      },
      {
        path: "products",
        element: <ProductsPage />,
      },
      {
        path: "orders",
        element: <OrdersPage />,
      },
      {
        path: "categories",
        element: <CategoriesPage />,
      },
      {
        path: "analytics",
        element: <AnalyticsPage />,
      }

    ],
  },
])