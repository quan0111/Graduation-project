# TỔNG HỢP CHỨC NĂNG CÁC FILE MÃ NGUỒN - MARKETHUB PROJECT

---

## TỔNG QUAN PROJECT

MarketHub là dự án E-commerce gồm 3 phần:
- **Backend (BE)**: Python FastAPI - Server API
- **User-FE**: React TypeScript - Frontend cho người mua
- **Admin-FE**: React TypeScript - Frontend cho admin

---

# PHẦN 1: BACKEND (BE) - PYTHON FASTAPI

---

## 1. CẤU TRÚC CHÍNH

### `BE/src/main.py`
- **Chức năng**: Entry point của FastAPI application
- **Mô tả**: Khởi tạo app, include routers, setup middleware, lifespan events

### `BE/src/core/` - Core Configuration
- **config.py**: Configuration settings (database, JWT, cloudinary, etc.)
- **database.py**: Database connection setup (PostgreSQL)
- **security.py**: Security utilities (JWT encoding/decoding, password hashing)
- **dependencies.py**: Dependency injection cho authentication
- **role.py**: Role-based access control
- **base.py**: Base models và utilities
- **cloudinary.py**: Cloudinary integration cho file upload
- **rate_limit.py**: Rate limiting implementation
- **IP_blacklist.py**: IP blacklist management
- **lifespan.py**: Application lifespan events
- **docs.py**: API documentation

### `BE/src/middleware/` - Middleware
- **auth_middleware.py**: Authentication middleware
- **error_handler.py**: Global error handling

### `BE/src/utils/` - Utilities
- Utilities functions chung

### `BE/src/api/` - API Routes
- Main API router aggregation

---

## 2. BACKEND MODULES (`BE/src/modules/`)

### 2.1 AUTH MODULE (`auth/`)
- **router.py**: Routes cho login, register, refresh token, forgot password, change password
- **schema.py**: Pydantic schemas cho auth (Login, Register, Token, User response)
- **service.py**: Business logic cho authentication (login, register, password management)

### 2.2 USER MODULE (`users/`)
- **users_router.py**: Routes quản lý users
- **users_schema.py**: Schemas cho user data
- **users_service.py**: Service quản lý users

### 2.3 ADDRESS MODULE (`address/`)
- **address_router.py**: Routes CRUD địa chỉ
- **address_schema.py**: Schemas cho address
- **address_service.py**: Service quản lý địa chỉ

### 2.4 CATEGORY MODULE (`category/`)
- **category_router.py**: Routes CRUD danh mục
- **category_schema.py**: Schemas cho category
- **category_service.py**: Service quản lý danh mục

### 2.5 PRODUCT MODULE (`product/`)
- **product_router.py**: Routes CRUD sản phẩm, variants, tags
- **product_schema.py**: Schemas cho product, variant, tag
- **service/product.py**: Service quản lý sản phẩm
- **service/product_tag.py**: Service quản lý tags sản phẩm

### 2.6 CART MODULE (`cart/`)
- **cart_router.py**: Routes giỏ hàng (add, update, delete, clear)
- **cart_schema.py**: Schemas cho cart
- **cart_service.py**: Service quản lý giỏ hàng

### 2.7 ORDER MODULE (`order/`)
- **order_router.py**: Routes đơn hàng (create, update, cancel, get orders)
- **order_schema.py**: Schemas cho order
- **order_service.py**: Service quản lý đơn hàng
- **momo_service.py**: Momo payment integration
- **vnpay_service.py**: VNPay payment integration
- **payment_service.py**: Payment service logic
- **utils/payment.py**: Payment utilities

### 2.8 SHIPMENT MODULE (`shipment/`)
- **shipment_router.py**: Routes shipment (create, update, track)
- **shipment_schema.py**: Schemas cho shipment
- **shipment_service.py**: Service quản lý shipment

### 2.9 PAYMENT MODULE (trong order/)
- **payment_service.py**: Service xử lý thanh toán
- **momo_service.py**: Integration với Momo
- **vnpay_service.py**: Integration với VNPay

### 2.10 SHOP MODULE (`shop/`)
- **shop_router.py**: Routes CRUD shop
- **shop_schema.py**: Schemas cho shop
- **shop_service.py**: Service quản lý shop

### 2.11 SELLER MODULE (`seller/`)
- **seller_router.py**: Routes seller (apply, get seller info)
- **seller_schema.py**: Schemas cho seller
- **seller_service.py**: Service quản lý seller

### 2.12 COUPON MODULE (`coupon/`)
- **coupon_router.py**: Routes coupon (create, update, validate, calculate discount)
- **coupon_schema.py**: Schemas cho coupon
- **coupon_service.py**: Service quản lý coupon

### 2.13 REVIEW MODULE (`review/`)
- **review_router.py**: Routes review (create, get, update, delete, statistics)
- **review_schema.py**: Schemas cho review
- **review_service.py**: Service quản lý review

### 2.14 RETURN REQUEST MODULE (`return_request/`)
- **return_router.py**: Routes return request (create, add items, review, get)
- **return_schema.py**: Schemas cho return request
- **return_service.py**: Service quản lý return request

### 2.15 CHATBOT MODULE (`chatbot/`)
- **chatbot_router.py**: Routes chatbot (send message)
- **chatbot_schema.py**: Schemas cho chatbot
- **chatbot_service.py**: Service xử lý chatbot với AI
- **ollama_client.py**: Ollama client cho AI inference

### 2.16 NOTIFICATION MODULE (`notification/`)
- **notification_router.py**: Routes notification (get, mark read)
- **notification_schema.py**: Schemas cho notification
- **notification_service.py**: Service quản lý notification
- **notification_manager.py**: Manager cho notification
- **notification_websocket.py**: WebSocket endpoint cho real-time notification

### 2.17 ADMIN MODULE (`admin/`)
- **admin_router.py**: Routes admin (manage users, sellers, shops)
- **admin_schema.py**: Schemas cho admin
- **admin_service.py**: Service quản lý admin

### 2.18 ANALYTICS MODULE (`analytics/`)
- **analytics_router.py**: Routes analytics (sales, orders, users stats)
- **analytics_schema.py**: Schemas cho analytics
- **analytics_service.py**: Service tính toán analytics

### 2.19 FINANCE MODULE (`finance/`)
- **finance_router.py**: Routes finance (transactions, payouts)
- **finance_schema.py**: Schemas cho finance
- **finance_service.py**: Service quản lý finance

### 2.20 MARKETING MODULE (`marketing/`)
- **marketing_router.py**: Routes marketing (campaigns, promotions)
- **marketing_schema.py**: Schemas cho marketing
- **marketing_service.py**: Service quản lý marketing

### 2.21 FOLLOWER MODULE (`follower/`)
- **follower_router.py**: Routes follower (follow/unfollow shop)
- **follower_schema.py**: Schemas cho follower
- **follower_service.py**: Service quản lý follower

### 2.22 UPLOAD MODULE (`upload/`)
- File upload handler (Cloudinary integration)

---

## 3. DATABASE

### `BE/prisma/`
- Prisma schema và migrations
- Database models definition

---

# PHẦN 2: USER FRONTEND (USER-FE) - REACT TYPESCRIPT

---

## 1. CẤU TRÚC PROJECT CHÍNH

### `user-fe/src/App.tsx`
- **Chức năng**: Entry point chính của ứng dụng React
- **Mô tả**: Render `RouterProvider` với cấu hình routing

### `user-fe/src/main.tsx`
- **Chức năng**: Khởi tạo React app
- **Mô tả**: Setup QueryClientProvider và render App

### `user-fe/src/routes/index.tsx`
- **Chức năng**: Cấu hình routing
- **Mô tả**: Định nghĩa tất cả routes (public, authenticated, seller)

---

## 2. COMPONENTS CHUNG (`user-fe/src/components/`)

### `user-fe/src/components/layout.tsx`
- Layout chính với Header, Footer, ChatbotWidget

### `user-fe/src/components/header.tsx`
- Header/Navigation với logo, search, cart, user info

### `user-fe/src/components/footer.tsx`
- Footer với thông tin liên hệ, links

### `user-fe/src/components/ui/` (Shadcn/UI)
- Button, Card, Input, Dialog, Table, Form components, etc.

---

## 3. LIBRARY & UTILITIES (`user-fe/src/lib/`)

### `user-fe/src/lib/api.ts`
- Axios instance với interceptors (auth, refresh token)

### `user-fe/src/lib/auth-storage.ts`
- Storage utilities cho auth tokens

### `user-fe/src/lib/react-query.ts`
- React Query config

### `user-fe/src/lib/utils.ts`
- Utility functions

---

## 4. STATE MANAGEMENT (`user-fe/src/stores/`)

### `user-fe/src/stores/auth.store.ts`
- Zustand store cho authentication

---

## 5. MODULES (`user-fe/src/modules/`)

### 5.1 AUTH MODULE
- **API**: login, register, logout, get-me, refresh-token, change-password, forgot-password
- **Components**: login-form, register-form, auth-layout, profileTab, passwordTab, addressTab, sidebar, avatarUpload
- **Views**: LoginPage, signupPage, me (account page)

### 5.2 ADDRESS MODULE
- **API**: get-address, add-address, update-address, delete-address, get-default-address
- **Views**: address management, create-address

### 5.3 CART MODULE
- **API**: get-cart, add-item, update-cart, delete-cart, clear-cart
- **Components**: cartItem, cartList, cartSummary, emptyCart, quantityControl, shopGroup, voucher
- **Views**: cart page

### 5.4 PRODUCT MODULE
- **API**: get-product, get-product-id, get-product-by-shop, add-product, update-product, update-variant-stock
- **Components**: productCard, productGrid, productInfo, gallery, price, description, specification, variantSelector, shippingInfo, vendorInfo, relatedProduct, review, filters (price, rating, shop)
- **Views**: product list, product detail

### 5.5 ORDER MODULE
- **API**: get-orders, get-order, add-order, update-order, cancel-order, get-payment, add-payment, upsert-shipment
- **Components**: orderCard, orderDetail, orderTimeLine, orderAction, checkout components (stepper, shippingForm, paymentMethod, orderSummary, confirmation)
- **Views**: order list, order detail, checkout

### 5.6 SHOP MODULE
- **API**: get-shop, get-shop-id, myshop, add-shop, update-shop-id
- **Components**: shop-layout, shop-info, identify-form, tax-form, shipping config
- **Views**: shop page

### 5.7 SELLER MODULE
- **API**: apply, get-my-application, get-dashboard
- **Components**: shop-layout, dashboard components (stats, orders, sales, products), add-product components (multi-step form)
- **Views**: seller registration, dashboard, new-product, orders, order-detail, returns, coupons

### 5.8 COUPON MODULE
- **API**: get-coupon, add-coupon, create-coupon, update-coupon
- **Components**: couponForm, couponInput
- **Views**: seller coupons

### 5.9 RETURN REQUEST MODULE
- **API**: create-return
- **Components**: returnRequestForm
- **Views**: seller returns management

### 5.10 REVIEW MODULE
- **API**: create-review
- **Components**: reviewForm
- **Integration**: product detail page

### 5.11 CHATBOT MODULE
- **API**: send-message
- **Components**: chatbot-widget với local knowledge base (trả lời câu hỏi về chính sách, vận chuyển, thanh toán, giới thiệu sản phẩm)

### 5.12 HOME MODULE
- **Components**: HomeContainer, heroSection, featureSection, categoryGrid, featureProduct, productCard, sectionHeading, newsLetter
- **Views**: home page

### 5.13 COMPARE MODULE
- **Components**: Table, productCard, addProductCard, specRow, summary, emptyState
- **Views**: product comparison page

### 5.14 CONTACT MODULE
- **Views**: contact, FAQ, privacy-policy, terms of service

### 5.15 PROMOTION MODULE
- **Views**: promotions page

### 5.16 NOTIFICATION MODULE
- **API**: notification
- **Types**: notification types

### 5.17 ABOUT MODULE
- **Views**: about page

### 5.18 RECOMMENDATION MODULE
- **API**: get-recommendations
- **Hooks**: useTrackProductBehavior

### 5.19 SHIPMENT MODULE
- **API**: get-shipment, upsert-shipment

### 5.20 USER MODULE
- **Types**: user types

### 5.21 USER BEHAVIOR MODULE
- **API**: track-behavior

### 5.22 UPLOAD MODULE
- **API**: upload

---

# PHẦN 3: ADMIN FRONTEND (ADMIN-FE) - REACT TYPESCRIPT

---

## 1. CẤU TRÚC PROJECT CHÍNH

### `admin-fe/src/App.tsx`
- Entry point chính

### `admin-fe/src/main.tsx`
- Khởi tạo React app với QueryClientProvider

### `admin-fe/src/routes/`
- Cấu hình routing cho admin

---

## 2. COMPONENTS CHUNG (`admin-fe/src/components/`)
- UI components (Shadcn/UI)
- Layout components

---

## 3. LIBRARY & UTILITIES (`admin-fe/src/lib/`)
- API client
- Auth storage
- React Query config
- Utils

---

## 4. MODULES (`admin-fe/src/modules/`)

### 4.1 AUTH MODULE
- **API**: login, register, logout, get-me, refresh-token, change-password, forgot-password
- **Views**: LoginPage, me (admin account)

### 4.2 HOME MODULE (Dashboard)
- **API**: dashboard, get_orders, get_seller, seller_stats, bulk_update_seller, update_seller-id
- **Views**: admin dashboard với stats và overview

### 4.3 ANALYTICS MODULE
- **Components**: analytics-header, analytics-stats-card
- **Views**: analytics page

### 4.4 CATEGORIES MODULE
- **API**: category, add-category, get-category, update-category
- **Components**: categories-collumn, category-action, category-create-modal, category-filter, category-stats
- **Views**: categories management

### 4.5 PRODUCTS MODULE
- **API**: get-all-product, get-product-id, add-product, update-product-id, delete-product, variant, add-variant
- **Components**: filter-search-product, product-action, product-badge, product-collum, product-preview-modal
- **Views**: products management

### 4.6 ORDERS MODULE
- **API**: get-all-orders, create-order, update-order, cancel-order, create-payment, update-payment
- **Components**: order-action, order-collums, order-detail-modal, order-stats, order-status-badge, search-filter-order
- **Views**: orders management

### 4.7 USERS MODULE
- **API**: (user management APIs)
- **Components**: filter-search-user, user-badge
- **Views**: users management

### 4.8 SHOP MODULE
- **API**: (shop management APIs)
- **Components**: filter-search-shop, shop-badge
- **Views**: shops management, seller applications

### 4.9 REVIEWS MODULE
- **API**: get-review, get-review-by-product, get-review-by-user, get-review-by-rating, get-review-paginated, get-review-stat, add-review, delete-review, update-review
- **Components**: rating-star, review-badge, review-collum, search-filter-review, stats-card
- **Views**: reviews management

### 4.10 RETURNS MODULE
- **API**: returns
- **Views**: returns management

### 4.11 SETTINGS MODULE
- **Components**: admin-management, database-setting, general-setting, notification-setting, security-setting
- **Views**: settings page

### 4.12 ADDRESS MODULE
- **API**: address, add-address, get-address, update-address
- **Types**: address types

### 4.13 TRANSACTION MODULE
- **Views**: transactions management

### 4.14 SUPPORT MODULE
- **Views**: support management

### 4.15 PROMOTIONS MODULE
- **Views**: promotions management

### 4.16 USER BEHAVIOR MODULE
- **API**: (behavior tracking APIs)
- **Views**: user behavior analytics

---

# PHẦN 4: ARCHITECTURE & TECHNOLOGIES

## BACKEND (BE)
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL với Prisma ORM
- **Authentication**: JWT với refresh token
- **File Storage**: Cloudinary
- **Payment Integration**: Momo, VNPay
- **Real-time**: WebSocket cho notifications
- **Rate Limiting**: Custom implementation
- **Security**: IP blacklist, role-based access control

## USER FRONTEND (USER-FE)
- **Framework**: React + TypeScript + Vite
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router v6
- **UI Components**: Shadcn/UI + TailwindCSS
- **HTTP Client**: Axios với interceptors
- **Styling**: TailwindCSS

## ADMIN FRONTEND (ADMIN-FE)
- **Framework**: React + TypeScript + Vite
- **State Management**: Zustand
- **Data Fetching**: React Query
- **Routing**: React Router v6
- **UI Components**: Shadcn/UI + TailwindCSS
- **HTTP Client**: Axios
- **Styling**: TailwindCSS

---

# PHẦN 5: TỔNG KẾT CHỨC NĂNG CHÍNH

## USER-FE (Người mua)
- Đăng ký/Đăng nhập tài khoản
- Quản lý profile, địa chỉ
- Tìm kiếm, lọc, so sánh sản phẩm
- Xem chi tiết sản phẩm, review
- Thêm vào giỏ hàng, checkout
- Thanh toán (Momo, VNPay, COD)
- Theo dõi đơn hàng
- Yêu cầu trả hàng
- Đánh giá sản phẩm
- Chatbot hỗ trợ
- Theo dõi shop yêu thích

## ADMIN-FE (Admin)
- Dashboard với analytics
- Quản lý users
- Quản lý sellers (duyệt đăng ký)
- Quản lý shops
- Quản lý products
- Quản lý categories
- Quản lý orders
- Quản lý reviews
- Quản lý returns
- Quản lý transactions
- Quản lý promotions
- Settings hệ thống

## BACKEND (API)
- Authentication & Authorization
- CRUD operations cho tất cả entities
- Payment processing (Momo, VNPay)
- Shipment tracking
- Notification system (WebSocket)
- Chatbot AI integration (Ollama)
- Analytics & Reporting
- File upload (Cloudinary)
- Rate limiting & Security

---

# PHẦN 6: DATABASE SCHEMA

Các bảng chính:
- **users**: Thông tin người dùng
- **shops**: Thông tin shop/seller
- **products**: Sản phẩm
- **product_variants**: Variants sản phẩm
- **categories**: Danh mục
- **carts**: Giỏ hàng
- **cart_items**: Items giỏ hàng
- **orders**: Đơn hàng
- **order_items**: Items đơn hàng
- **payments**: Thanh toán
- **shipments**: Vận chuyển
- **coupons**: Mã giảm giá
- **reviews**: Đánh giá
- **return_requests**: Yêu cầu trả hàng
- **notifications**: Thông báo
- **followers**: Theo dõi shop
- **transactions**: Giao dịch tài chính

---

# PHẦN 7: API ENDPOINTS SUMMARY

## Auth Endpoints
- POST /auth/login
- POST /auth/register
- POST /auth/refresh
- POST /auth/logout
- POST /auth/forgot-password
- POST /auth/change-password
- GET /auth/me

## Product Endpoints
- GET /products
- GET /products/{id}
- POST /products
- PUT /products/{id}
- DELETE /products/{id}

## Order Endpoints
- GET /orders
- GET /orders/{id}
- POST /orders
- PUT /orders/{id}
- POST /orders/{id}/cancel
- POST /orders/{id}/payment

## Payment Endpoints
- POST /payments/momo
- POST /payments/vnpay
- GET /payments/{order_id}

## Shipment Endpoints
- GET /shipments/{order_id}
- POST /shipments
- PUT /shipments/{id}
- GET /shipments/track/{tracking_number}

## Coupon Endpoints
- GET /coupons
- GET /coupons/{id}
- GET /coupons/code/{code}
- POST /coupons
- PUT /coupons/{id}
- POST /coupons/{id}/activate
- POST /coupons/{id}/deactivate
- POST /coupons/validate
- POST /coupons/calculate-discount

## Review Endpoints
- GET /reviews
- GET /reviews/{id}
- GET /reviews/product/{product_id}
- GET /reviews/user/{user_id}
- POST /reviews
- PUT /reviews/{id}
- DELETE /reviews/{id}

## Return Request Endpoints
- POST /return-requests
- POST /return-requests/{id}/items
- POST /return-requests/{id}/evidence
- POST /return-requests/{id}/review
- GET /return-requests/{id}
- GET /return-requests/user/{user_id}
- GET /return-requests/seller

## Chatbot Endpoints
- POST /chatbot/message

## Admin Endpoints
- GET /admin/users
- GET /admin/sellers
- PUT /admin/sellers/{id}/approve
- PUT /admin/sellers/{id}/reject
- GET /admin/analytics
- GET /admin/transactions

---

# PHẦN 8: DEPLOYMENT

## Docker Setup
- `docker-compose.yml`: Orchestrate backend, frontend containers
- `nginx/`: Nginx configuration for reverse proxy

## Environment Variables
- Backend: Database URL, JWT secret, Cloudinary keys, Momo/VNPay keys
- Frontend: API URL

---

**Tài liệu được tạo ngày:** 2025
**Phiên bản:** 1.0
