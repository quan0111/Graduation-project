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
import PaymentSuccessPage from "@/modules/order/view/payment-success";
import ReturnHistoryPage from "@/modules/return-request/view/history";

import AccountPage from "@/modules/auth/view/me";
import PromotionPage from "@/modules/promotion/view";

import { SellerRegistrationView } from "@/modules/seller/view/create";
import SellerDashboardPage from "@/modules/seller/view/dashboard";
import AddProductPage from "@/modules/seller/view/new-product";
import SellerOrdersPage from "@/modules/seller/view/orders";
import SellerOrderDetailPage from "@/modules/seller/view/order-detail";
import SellerReturnsPage from "@/modules/seller/view/returns";
import SellerViolationsPage from "@/modules/seller/view/violations";
import SellerProductsPage from "@/modules/seller/view/products";
import SellerFinancePage from "@/modules/seller/view/finance";
import SellerCouponsPage from "@/modules/seller/view/coupons";
import SellerSupportPage from "@/modules/seller/view/support";
import { RequireAuth, RequireSeller } from "./guards";
export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      { index: true, element: <Home /> },


      { path: "cart", element: <RequireAuth><CartPage /></RequireAuth> },

      { path: "products", element: <ProductPage /> },
      { path: "product/:id", element: <ProductDetailPage /> },

      { path: "checkout", element: <RequireAuth><CheckOutPage /></RequireAuth> },
      { path: "payment-success", element: <RequireAuth><PaymentSuccessPage /></RequireAuth> },

      { path: "orders", element: <RequireAuth><OrderPage /></RequireAuth> },
      { path: "orders/:id", element: <RequireAuth><OrderDetailPage /></RequireAuth> },
      { path: "returns", element: <RequireAuth><ReturnHistoryPage /></RequireAuth> },

      { path: "account", element: <RequireAuth><AccountPage /></RequireAuth> },
      { path: "profile", element: <RequireAuth><AccountPage /></RequireAuth> },

      { path: "promotions", element: <PromotionPage /> },
      { path: "shop/:id", element: <ShopPage /> },
    ],
  },
        { path: "login", element: <LoginPage /> },
      { path: "register", element: <SignupPage /> },

  {
    path: "/seller",
    element: <RequireAuth><SellerRegistrationView /></RequireAuth>,
  },
  {
    path: "/seller/dashboard",
    element: <RequireSeller><SellerDashboardPage /></RequireSeller>,
  },
  {
    path: "/seller/orders",
    element: <RequireSeller><SellerOrdersPage /></RequireSeller>,
  },
  {
    path: "/seller/orders/:id",
    element: <RequireSeller><SellerOrderDetailPage /></RequireSeller>,
  },
  {
    path: "/seller/returns",
    element: <RequireSeller><SellerReturnsPage /></RequireSeller>,
  },
  {
    path: "/seller/violations",
    element: <RequireSeller><SellerViolationsPage /></RequireSeller>,
  },
  {
    path: "/seller/products",
    element: <RequireSeller><SellerProductsPage /></RequireSeller>,
  },
  {
    path: "/seller/products/new",
    element: <RequireSeller><AddProductPage /></RequireSeller>,
  },
  {
    path: "/seller/finance",
    element: <RequireSeller><SellerFinancePage /></RequireSeller>,
  },
  {
    path: "/seller/coupons",
    element: <RequireSeller><SellerCouponsPage /></RequireSeller>,
  },
  {
    path: "/seller/support",
    element: <RequireSeller><SellerSupportPage /></RequireSeller>,
  },
]);
