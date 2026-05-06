import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/layout";

import Home from "../modules/home/view/index";
import LoginPage from "../modules/auth/view/LoginPage";
import SignupPage from "@/modules/auth/view/signupPage";

import CartPage from "@/modules/cart/view";
import ProductDetailPage from "@/modules/product/view/product-detail";
import ProductPage from "@/modules/product/view";
import ShopPage from "@/modules/shop/view";
import CheckOutPage from "@/modules/order/view/checkout";
import OrderPage from "@/modules/order/view/order";
import OrderDetailPage from "@/modules/order/view/order-detail";

import AccountPage from "@/modules/auth/view/me";
import PromotionPage from "@/modules/promotion/view";

import { SellerRegistrationView } from "@/modules/seller/view/create";
import SellerDashboardPage from "@/modules/seller/view/dashboard";
import AddProductPage from "@/modules/seller/view/new-product";
import SellerOrdersPage from "@/modules/seller/view/orders";
import SellerOrderDetailPage from "@/modules/seller/view/order-detail";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },


      { path: "cart", element: <CartPage /> },

      { path: "products", element: <ProductPage /> },
      { path: "product/:id", element: <ProductDetailPage /> },

      { path: "checkout", element: <CheckOutPage /> },

      { path: "orders", element: <OrderPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },

      { path: "account", element: <AccountPage /> },
      { path: "profile", element: <AccountPage /> },

      { path: "promotions", element: <PromotionPage /> },
      { path: "shop/:id", element: <ShopPage /> },
    ],
  },
        { path: "login", element: <LoginPage /> },
      { path: "register", element: <SignupPage /> },

  {
    path: "/seller",
    element: <SellerRegistrationView />,
  },
  {
    path: "/seller/dashboard",
    element: <SellerDashboardPage />,
  },
  {
    path: "/seller/orders",
    element: <SellerOrdersPage />,
  },
  {
    path: "/seller/orders/:id",
    element: <SellerOrderDetailPage />,
  },
  {
    path: "/seller/products/new",
    element: <AddProductPage />,
  },
]);
