# TỔNG HỢP CHỨC NĂNG CÁC FILE MÃ NGUỒN - MARKETHUB FRONTEND

---

## 1. CẤU TRÚC PROJECT CHÍNH

### `src/App.tsx`
- **Chức năng**: Entry point chính của ứng dụng React
- **Mô tả**: Render `RouterProvider` với cấu hình routing từ `routes/index.tsx`

### `src/main.tsx`
- **Chức năng**: Khởi tạo React app và mount vào DOM
- **Mô tả**: Setup QueryClientProvider cho React Query và render App component

### `src/routes/index.tsx`
- **Chức năng**: Cấu hình routing của ứng dụng
- **Mô tả**: Định nghĩa tất cả routes (public routes, authenticated routes, seller routes, admin routes)

### `src/App.css`, `src/index.css`
- **Chức năng**: CSS global styles
- **Mô tả**: Các style mặc định cho toàn bộ ứng dụng

---

## 2. COMPONENTS CHUNG (`src/components/`)

### `src/components/layout.tsx`
- **Chức năng**: Layout chính của ứng dụng
- **Mô tả**: Bọc Header, Footer, ChatbotWidget và Outlet cho các routes con

### `src/components/header.tsx`
- **Chức năng**: Header/Navigation bar
- **Mô tả**: Hiển thị logo, search, cart, user info, navigation links

### `src/components/footer.tsx`
- **Chức năng**: Footer của trang
- **Mô tả**: Hiển thị thông tin liên hệ, links hữu ích, social media

### `src/components/pagination.tsx`
- **Chức năng**: Component phân trang
- **Mô tả**: UI cho phân trang danh sách

### `src/components/ui/` (Shadcn/UI Components)
- **accordion.tsx**: Accordion component
- **badge.tsx**: Badge component
- **breadcrumb.tsx**: Breadcrumb navigation
- **button.tsx**: Button component với các variants
- **card.tsx**: Card component
- **carousel.tsx**: Carousel/slider component
- **checkbox.tsx**: Checkbox component
- **combobox.tsx**: Combobox component
- **command.tsx**: Command palette
- **dialog.tsx**: Dialog/Modal component
- **drawer.tsx**: Drawer/Sidebar component
- **empty.tsx**: Empty state component
- **field.tsx**: Form field component
- **input-group.tsx**: Input group component
- **input.tsx**: Input component
- **item.tsx**: List item component
- **label.tsx**: Label component
- **pagination.tsx**: Pagination component
- **radio-group.tsx**: Radio button group
- **select.tsx**: Select dropdown
- **separator.tsx**: Separator/divider
- **switch.tsx**: Toggle switch
- **table.tsx**: Table component
- **tabs.tsx**: Tabs component
- **textarea.tsx**: Textarea component

---

## 3. LIBRARY & UTILITIES (`src/lib/`)

### `src/lib/api.ts`
- **Chức năng**: Axios instance và interceptors
- **Mô tả**: 
  - Tạo axios client với baseURL
  - Request interceptor: thêm Authorization header
  - Response interceptor: xử lý refresh token, 401 errors

### `src/lib/auth-storage.ts`
- **Chức năng**: Lưu trữ authentication tokens
- **Mô tả**: Hàm lưu/truy xuất access token từ localStorage/sessionStorage

### `src/lib/react-query.ts`
- **Chức năng**: Config cho React Query
- **Mô tả**: MutationConfig type và utilities cho React Query

### `src/lib/utils.ts`
- **Chức năng**: Utility functions
- **Mô tả**: Các hàm helper chung (cn cho classnames, v.v.)

---

## 4. STATE MANAGEMENT (`src/stores/`)

### `src/stores/auth.store.ts`
- **Chức năng**: Zustand store cho authentication
- **Mô tả**: Quản lý user state, login, logout với persistence

---

## 5. CONSTANTS & CONFIG (`src/constant/`)

### `src/constant/config.ts`
- **Chức năng**: API endpoints constants
- **Mô tả**: Định nghĩa tất cả API URL (AUTH, PRODUCT, CART, ORDER, COUPON, RETURN, v.v.)

### `src/constant/index.ts`
- **Chức năng**: Export constants
- **Mô tả**: Re-export tất cả constants

---

## 6. CUSTOM HOOKS (`src/hook/`)

### `src/hook/useDebounce.ts`
- **Chức năng**: Debounce hook
- **Mô tả**: Hook để debounce input values

---

## 7. COMMON TYPES (`src/common/`)

### `src/common/type.ts`
- **Chức năng**: Common TypeScript types
- **Mô tả**: Các type definitions dùng chung toàn app

---

## 8. MODULES

### 8.1 AUTH MODULE (`src/modules/auth/`)

#### API Files (`api/`)
- **login.ts**: API đăng nhập
- **register.ts**: API đăng ký
- **logout.ts**: API đăng xuất
- **get-auth-me.ts**: API lấy thông tin user hiện tại
- **refresh-token.ts**: API refresh access token
- **change-password.ts**: API đổi mật khẩu
- **forgot-password.ts**: API quên mật khẩu

#### Components (`components/`)
- **login-form.tsx**: Form đăng nhập
- **register-form.tsx**: Form đăng ký
- **auth-layout.tsx**: Layout cho auth pages
- **sidebar.tsx**: Sidebar cho account page
- **profileTab.tsx**: Tab thông tin cá nhân
- **passwordTab.tsx**: Tab đổi mật khẩu
- **addressTab.tsx**: Tab quản lý địa chỉ
- **addressCard.tsx**: Card hiển thị địa chỉ
- **avatarUpload.tsx**: Upload avatar
- **contentSwitcher.tsx**: Switcher nội dung

#### Views (`view/`)
- **LoginPage.tsx**: Trang đăng nhập
- **signupPage.tsx**: Trang đăng ký
- **me/index.tsx**: Trang tài khoản cá nhân

#### Hooks (`hook/`)
- **useAccount.ts**: Hook quản lý account state

#### Types (`types/`)
- **index.ts**: TypeScript types cho auth

---

### 8.2 ADDRESS MODULE (`src/modules/address/`)

#### API Files (`api/`)
- **get-address.ts**: API lấy danh sách địa chỉ
- **get-default-address.ts**: API lấy địa chỉ mặc định
- **add-address.ts**: API thêm địa chỉ mới
- **update-address.ts**: API cập nhật địa chỉ
- **delete-address.ts**: API xóa địa chỉ

#### Views (`view/`)
- **address.ts/**: Trang quản lý địa chỉ
- **create-address.ts/**: Trang tạo địa chỉ mới

#### Types (`types/`)
- **index.ts**: TypeScript types cho address

---

### 8.3 CART MODULE (`src/modules/cart/`)

#### API Files (`api/`)
- **get-cart.ts**: API lấy giỏ hàng
- **get-my-cart.ts**: API lấy giỏ hàng của user
- **add-item.ts**: API thêm item vào giỏ
- **update-cart.ts**: API cập nhật giỏ hàng
- **delete-cart.ts**: API xóa item khỏi giỏ
- **clear-cart.ts**: API xóa toàn bộ giỏ hàng

#### Components (`components/`)
- **cartItem.tsx**: Component item trong giỏ
- **cartList.tsx**: Danh sách items giỏ hàng
- **cartSummary.tsx**: Tổng tiền giỏ hàng
- **emptyCart.tsx**: State giỏ hàng trống
- **quantityControl.tsx**: Control số lượng
- **shopGroup.tsx**: Group items theo shop
- **voucher.tsx**: Voucher component

#### Views (`view/`)
- **index.tsx**: Trang giỏ hàng

#### Hooks (`hooks/`)
- **useCart.ts**: Hook quản lý giỏ hàng

#### Types (`types/`)
- **index.ts**: TypeScript types cho cart

---

### 8.4 CATEGORY MODULE (`src/modules/category/`)

#### API Files (`api/`)
- **category.ts**: API danh mục
- **get-category.ts**: API lấy danh mục
- **add-category.ts**: API thêm danh mục
- **update-category.ts**: API cập nhật danh mục

#### Types (`types/`)
- **index.ts**: TypeScript types cho category

---

### 8.5 PRODUCT MODULE (`src/modules/product/`)

#### API Files (`api/`)
- **get-product.ts**: API lấy danh sách sản phẩm
- **get-product-id.ts**: API lấy sản phẩm theo ID
- **get-product-by-shop.ts**: API lấy sản phẩm theo shop
- **add-product.ts**: API thêm sản phẩm
- **update-product.ts**: API cập nhật sản phẩm
- **update-variant-stock.ts**: API cập nhật stock variant

#### Components (`components/`)
- **productCard.tsx**: Card sản phẩm
- **productGrid.tsx**: Grid sản phẩm
- **productInfo.tsx**: Thông tin sản phẩm
- **gallery.tsx**: Gallery ảnh sản phẩm
- **price.tsx**: Hiển thị giá
- **description.tsx**: Mô tả sản phẩm
- **specification.tsx**: Thông số kỹ thuật
- **variantSelector.tsx**: Chọn variant
- **shippingInfo.tsx**: Thông tin vận chuyển
- **vendorInfo.tsx**: Thông tin seller
- **relatedProduct.tsx**: Sản phẩm liên quan
- **review.tsx**: Review sản phẩm
- **sideBar.tsx**: Sidebar filter
- **priceFilter.tsx**: Filter giá
- **ratingFilter.tsx**: Filter đánh giá
- **shopFilter.tsx**: Filter shop
- **catalogHeader.tsx**: Header danh mục
- **catalogSearch.tsx**: Search danh mục
- **toolBar.tsx**: Toolbar
- **tag.tsx**: Tag sản phẩm
- **Action.tsx**: Action buttons

#### Views (`view/`)
- **index.tsx**: Trang danh sách sản phẩm
- **product-detail/index.tsx**: Trang chi tiết sản phẩm

#### Hooks (`hooks/`)
- **useProduct.tsx**: Hook quản lý sản phẩm
- **useProductDetail.tsx**: Hook chi tiết sản phẩm
- **useFilter.tsx**: Hook filter sản phẩm

#### Types (`types/`)
- **index.ts**: TypeScript types cho product
- **filter.ts**: Types cho filter

#### Utils (`utils/`)
- **normalize-product.ts**: Normalize product data
- **formater.tsx**: Format utilities
- **storage.tsx**: Storage utilities

---

### 8.6 ORDER MODULE (`src/modules/order/`)

#### API Files (`api/`)
- **get-orders.ts**: API lấy danh sách đơn hàng
- **get-order.ts**: API lấy đơn hàng theo ID
- **get-seller-orders.ts**: API lấy đơn hàng seller
- **get-seller-order.ts**: API lấy đơn hàng seller theo ID
- **add-order.ts**: API tạo đơn hàng
- **update-order.ts**: API cập nhật đơn hàng
- **cancel-order.ts**: API hủy đơn hàng
- **get-payment.ts**: API lấy payment
- **get-payment-by-order.ts**: API lấy payment theo order
- **add-payment.ts**: API thêm payment
- **update-payment.ts**: API cập nhật payment
- **create-payment-qr.ts**: API tạo QR thanh toán
- **upsert-shipment.ts**: API tạo/cập nhật shipment
- **mapper.ts**: Mapper functions

#### Components (`components/`)
- **orderCard.tsx**: Card đơn hàng
- **orderHeader.tsx**: Header đơn hàng
- **orderItems.tsx**: Items đơn hàng
- **orderItemList.tsx**: List items
- **orderDetail.tsx**: Chi tiết đơn hàng
- **orderTimeLine.tsx**: Timeline đơn hàng
- **orderAction.tsx**: Action buttons
- **orderContainer.tsx**: Container đơn hàng
- **summary.tsx**: Summary đơn hàng
- **shipping.tsx**: Shipping info
- **filterTab.tsx**: Filter tabs
- **emptyState.tsx**: Empty state

#### Checkout Components (`components/checkout/`)
- **stepper.tsx**: Stepper checkout
- **shippingForm.tsx**: Form shipping
- **shippingMethod.tsx**: Phương thức vận chuyển
- **paymentMethod.tsx**: Phương thức thanh toán
- **orderSumary.tsx**: Summary checkout
- **confirmation.tsx**: Xác nhận

#### Views (`view/`)
- **order/index.tsx**: Trang danh sách đơn hàng
- **order-detail/index.tsx**: Trang chi tiết đơn hàng
- **checkout/index.tsx**: Trang checkout

#### Hooks (`hook/`)
- **useOrder.ts**: Hook quản lý đơn hàng
- **useOrderDetail.ts**: Hook chi tiết đơn hàng
- **useCheckout.ts**: Hook checkout

#### Types (`types/`)
- **index.ts**: TypeScript types cho order

#### Utils (`utils/`)
- **order.ts**: Order utilities

---

### 8.7 SHOP MODULE (`src/modules/shop/`)

#### API Files (`api/`)
- **get-shop.ts**: API lấy danh sách shop
- **get-shop-id.ts**: API lấy shop theo ID
- **myshop.ts**: API lấy shop của user
- **add-shop.ts**: API tạo shop
- **update-shop-id.ts**: API cập nhật shop

#### Components (`component/`)
- **shop-layout.tsx**: Layout shop
- **shop-info.tsx**: Thông tin shop
- **identify-form.tsx**: Form xác nhận
- **tax-form.tsx**: Form thuế
- **shipp-setting.tsx**: Cài đặt shipping
- **shipping-config.tsx**: Config shipping
- **step-indicator.tsx**: Step indicator
- **dash-board-overview.tsx**: Dashboard overview
- **product-management.tsx**: Quản lý sản phẩm
- **order-management.tsx**: Quản lý đơn hàng
- **batch-shipping.tsx**: Batch shipping
- **return-refunds.tsx**: Trả hàng/hoàn tiền

#### Views (`view/`)
- **index.tsx**: Trang shop

#### Types (`types/`)
- **index.ts**: TypeScript types cho shop

---

### 8.8 SELLER MODULE (`src/modules/seller/`)

#### API Files (`api/`)
- **apply.ts**: API đăng ký seller
- **get-my-application.ts**: API lấy đơn đăng ký
- **get-dashboard.ts**: API lấy dashboard data

#### Components (`component/`)
- **shop-layout.tsx**: Layout seller
- **identify-form.tsx**: Form xác nhận
- **tax-form.tsx**: Form thuế
- **shipp-setting.tsx**: Cài đặt shipping
- **step-indicator.tsx**: Step indicator
- **shop-info.tsx**: Thông tin shop
- **basicTab.tsx**: Tab cơ bản
- **descriptionTab.tsx**: Tab mô tả
- **shippingTab.tsx**: Tab shipping
- **sellingTab.tsx**: Tab bán hàng
- **productTab.tsx**: Tab sản phẩm
- **product-header.tsx**: Header sản phẩm
- **productImages.tsx**: Ảnh sản phẩm
- **variantTable.tsx**: Table variant
- **ActionButton.tsx**: Action button

#### Add Product Components (`component/add-product/`)
- **stepSideBar.tsx**: Sidebar steps
- **detailStep.tsx**: Step chi tiết
- **mediaStep.tsx**: Step media
- **sellingStep.tsx**: Step bán hàng
- **shippingStep.tsx**: Step shipping
- **field.tsx**: Form field
- **accessCard.tsx**: Access card
- **variantRow.tsx**: Row variant
- **variantTable.tsx**: Table variant
- **validationList.tsx**: List validation

#### Dashboard Components (`component/dash-board/`)
- **dashboard-hero.tsx**: Hero section
- **dashboard-state.tsx**: State dashboard
- **stats-grid.tsx**: Grid stats
- **order-overview-card.tsx**: Card overview đơn hàng
- **sales-analytics-card.tsx**: Card analytics
- **recent-orders-card.tsx**: Card đơn hàng gần đây
- **top-products-card.tsx**: Card sản phẩm top
- **todo-panel.tsx**: Panel todo

#### Views (`view/`)
- **create/index.tsx**: Trang đăng ký seller
- **dashboard/index.tsx**: Trang dashboard seller
- **new-product/index.tsx**: Trang thêm sản phẩm
- **orders/index.tsx**: Trang đơn hàng seller
- **order-detail/index.tsx**: Trang chi tiết đơn hàng seller
- **returns/index.tsx**: Trang quản lý trả hàng seller
- **coupons/index.tsx**: Trang quản lý coupon seller

#### Hooks (`hooks/`)
- **useStepState.ts**: Hook quản lý step
- **useDetailState.ts**: Hook quản lý detail state
- **useMediaState.ts**: Hook quản lý media state
- **useSellingState.ts**: Hook quản lý selling state
- **useShippingState.ts**: Hook quản lý shipping state

#### Types (`types/`)
- **index.ts**: TypeScript types chung
- **seller.ts**: Types seller
- **dashboard.ts**: Types dashboard
- **addproduct.ts**: Types thêm sản phẩm

#### Utils (`utils/`)
- **addproduct.ts**: Utils thêm sản phẩm
- **dashboard.ts**: Utils dashboard

---

### 8.9 COUPON MODULE (`src/modules/coupon/`)

#### API Files (`api/`)
- **get-coupon.ts**: API lấy coupon
- **add-coupon.ts**: API thêm coupon
- **create-coupon.ts**: API tạo coupon
- **update-coupon.ts**: API cập nhật coupon

#### Components (`components/`)
- **couponForm.tsx**: Form tạo/cập nhật coupon
- **couponInput.tsx**: Input nhập coupon

#### Types (`types/`)
- **index.ts**: TypeScript types cho coupon

---

### 8.10 RETURN REQUEST MODULE (`src/modules/return-request/`)

#### API Files (`api/`)
- **create-return.ts**: API tạo yêu cầu trả hàng

#### Components (`components/`)
- **returnRequestForm.tsx**: Form yêu cầu trả hàng

---

### 8.11 REVIEW MODULE (`src/modules/review/`)

#### API Files (`api/`)
- **create-review.ts**: API tạo review

#### Components (`components/`)
- **reviewForm.tsx**: Form review

---

### 8.12 CHATBOT MODULE (`src/modules/chatbot/`)

#### API Files (`api/`)
- **send-message.ts**: API gửi tin nhắn chatbot

#### Components (`components/`)
- **chatbot-widget.tsx**: Widget chatbot với local knowledge base

#### Types (`types/`)
- **index.ts**: TypeScript types cho chatbot

---

### 8.13 HOME MODULE (`src/modules/home/`)

#### Components (`component/`)
- **HomeContainer.tsx**: Container trang chủ
- **heroSection.tsx**: Hero section
- **featureSection.tsx**: Feature section
- **categoryGrid.tsx**: Grid danh mục
- **featureProduct.tsx**: Sản phẩm nổi bật
- **productCard.tsx**: Card sản phẩm
- **sectionHeading.tsx**: Heading section
- **newsLetter.tsx**: Newsletter signup

#### Views (`view/`)
- **index.tsx**: Trang chủ

---

### 8.14 COMPARE MODULE (`src/modules/compare/`)

#### Components (`components/`)
- **Table.tsx**: Table so sánh
- **productCard.tsx**: Card sản phẩm
- **addProductCard.tsx**: Card thêm sản phẩm
- **specRow.tsx**: Row thông số
- **summary.tsx**: Summary
- **emptyState.tsx**: Empty state

#### Views (`view/`)
- **index.tsx**: Trang so sánh sản phẩm

#### Hooks (`hook/`)
- **useCompare.ts**: Hook quản lý so sánh

---

### 8.15 CONTACT MODULE (`src/modules/contact/`)

#### Views (`view/`)
- **contact/index.tsx**: Trang liên hệ
- **faq/index.tsx**: Trang FAQ
- **privacy-policy/index.tsx**: Trang chính sách bảo mật
- **tearmOfService/index.tsx**: Trang điều khoản dịch vụ

---

### 8.16 PROMOTION MODULE (`src/modules/promotion/`)

#### Views (`view/`)
- **index.tsx**: Trang khuyến mãi

---

### 8.17 NOTIFICATION MODULE (`src/modules/notification/`)

#### API Files (`api/`)
- **notification.ts**: API thông báo

#### Types (`types/`)
- **index.ts**: TypeScript types cho notification

---

### 8.18 ABOUT MODULE (`src/modules/about/`)

#### Views (`view/`)
- **index.tsx**: Trang về chúng tôi

---

### 8.19 RECOMMENDATION MODULE (`src/modules/recommendation/`)

#### API Files (`api/`)
- **get-recommendations.ts**: API lấy gợi ý sản phẩm

#### Hooks (`hooks/`)
- **useTrackProductBehavior.ts**: Hook theo dõi hành vi sản phẩm

---

### 8.20 SHIPMENT MODULE (`src/modules/shipment/`)

#### API Files (`api/`)
- **get-shipment.ts**: API lấy shipment
- **upsert-shipment.ts**: API tạo/cập nhật shipment

---

### 8.21 USER MODULE (`src/modules/user/`)

#### Types (`types/`)
- **index.ts**: TypeScript types cho user

---

### 8.22 USER BEHAVIOR MODULE (`src/modules/userBehavior/`)

#### API Files (`api/`)
- **track-behavior.ts**: API track hành vi user

---

### 8.23 UPLOAD MODULE (`src/modules/upload/`)

#### API Files (`api/`)
- **upload.ts**: API upload file

---

## 9. SUMMARY

### Tổng quan:
- **Framework**: React + TypeScript + Vite
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Routing**: React Router v6
- **UI Components**: Shadcn/UI + TailwindCSS
- **HTTP Client**: Axios với interceptors cho auth
- **Styling**: TailwindCSS

### Các module chính:
1. **Auth**: Đăng nhập, đăng ký, quản lý tài khoản
2. **Product**: Quản lý, hiển thị, tìm kiếm sản phẩm
3. **Cart**: Giỏ hàng, thêm/xóa/cập nhật items
4. **Order**: Đơn hàng, checkout, payment, shipment
5. **Seller**: Dashboard seller, quản lý sản phẩm, đơn hàng
6. **Shop**: Quản lý shop, thông tin shop
7. **Coupon**: Quản lý mã giảm giá
8. **Return Request**: Yêu cầu trả hàng
9. **Review**: Đánh giá sản phẩm
10. **Chatbot**: Trợ lý AI với local knowledge base
11. **Compare**: So sánh sản phẩm
12. **Address**: Quản lý địa chỉ
13. **Notification**: Thông báo
14. **Recommendation**: Gợi ý sản phẩm dựa trên hành vi

### Architecture pattern:
- **Feature-based module structure**: Mỗi module có api, components, views, hooks, types, utils riêng
- **Separation of concerns**: API calls tách biệt từ UI components
- **Type-safe**: TypeScript strict mode
- **Reusable components**: UI components trong thư mục components/ui
- **Centralized routing**: Tất cả routes trong routes/index.tsx
