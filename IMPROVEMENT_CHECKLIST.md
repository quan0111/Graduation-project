# MarketHub — Danh sách cải thiện trước bảo vệ đồ án

> Tổng hợp từ quá trình review toàn bộ codebase: schema, backend API, user-fe, admin-fe, recommendation, chatbot.
> **Cập nhật audit sâu:** 2026-05-18 (lần 1) · **Audit siêu sâu lần 2:** 2026-05-18 — cart, auth, notification WS, admin reviews, return, config, schema orphan.

---

## 🔴 Phải sửa trước bảo vệ

> Những lỗi này sẽ bị hội đồng phát hiện ngay khi demo.

- [x] **[1] Review button không bao giờ hiện — `user-fe`**
  - File: `src/modules/product/view/product-detail/index.tsx`
  - ✅ Đã sửa: `useAuthStore` → `userId={user?.id}` vào `<ProductReviews />`

- [x] **[2] Admin Analytics dùng mock data hardcode — `admin-FE`**
  - File: `src/modules/analytics/view/index.tsx`
  - ✅ Đã sửa: Kết nối API thật (`/analytics/top-products`, finance, dashboard, orders)

- [x] **[3] Console.log còn trong production code — `admin-FE`**
  - File: `src/modules/orders/view/index.tsx`
  - ✅ Đã sửa

- [x] **[4] Commission hardcode 10%, không dùng config — `backend`**
  - File: `BE/src/modules/finance/finance_service.py`
  - ✅ Đã sửa: `ShopCommissionConfig` → `CategoryCommissionConfig` → fallback 10%

- [x] **[5] Chatbot local knowledge base có mock product data — `user-fe`**
  - File: `src/modules/chatbot/components/chatbot-widget.tsx`
  - ✅ Đã sửa: KB chỉ còn FAQ chính sách, không còn iPhone/MacBook giả

---

## 🟡 Nên sửa — Lỗi logic nghiệp vụ (đã xử lý)

- [x] **[6] Seller không có action đổi trạng thái đơn hàng — `user-fe`**
- [x] **[7] Review filter buttons tĩnh — `user-fe` / `review.tsx`
- [x] **[8] Rating summary luôn 5 sao — `user-fe` / `review.tsx`
- [x] **[9] Follow shop không gọi API — `user-fe` / `shop/view`
- [x] **[10] Admin Categories Edit/Delete console.log — `admin-FE`
- [x] **[11] Admin Shops action buttons — `admin-FE`
- [x] **[12] Admin Products category filter hardcode — `admin-FE`
- [x] **[13] Coupon race condition — `backend` / `use_coupon()` atomic increment
- [x] **[14] Review hard delete — `backend` → soft delete `deletedAt`
- [x] **[15] Tax tính ở FE không có trong schema — `tax = 0`, không cộng total
- [x] **[16] Recommendation reason không nhất quán — shared `recommendation_reason.py`
- [x] **[17] `recommendationReason` thiếu trong TS type — `IProduct`
- [x] **[18] Retry payment `providerOrderId` unique conflict — `backend`**
  - ✅ Đã sửa (MoMo): `momo_service.py` dùng `ORDER-{orderId}-{uuid12}` mỗi lần tạo; `create_gateway_payment` update bản ghi cũ thay vì create mới.
  - ⚠️ Vẫn cần: callback idempotent (xem **[36]**), verify amount (xem **[37]**).

---

## 🟢 Cải thiện UX / Code quality (đã xử lý)

- [x] **[19] `window.location.reload()` → invalidate query
- [x] **[20] Checkout state mất khi refresh — `sessionStorage` `markethub.checkout.items`
- [x] **[21] Chatbot conversation history gửi lên BE
- [x] **[22] Cookie `secure` theo `COOKIE_SECURE` / `DEBUG`
- [x] **[23] Seller submit sản phẩm DRAFT để admin duyệt
- [x] **[24] Seller edit sản phẩm qua modal inline

---

## 🟡 Seller registration (đã xử lý phần lớn)

- [x] **[25-A] Nút "Quay lại" Identity/Tax không có handler**
  - ✅ `onPrev={handlePrevStep}` trong `identify-form.tsx`, `tax-form.tsx`

- [x] **[25-B] Identity (CCCD) không gửi lên server**
  - ✅ `handleComplete()` upload Cloudinary + gửi `identityFullName`, `identityNumber`, `identityFrontUrl`, `identityBackUrl` (`seller_schema.py` đã có field)

- [x] **[25-C] Shipping toggles và Tax form ghi đè nhau — `user-fe`**
  - Đã cải thiện: `handleTaxSubmit` merge `{ ...previous.taxInfo, ...data }`; payload tách `shippingOptions` riêng khi submit.
  - ⚠️ **Còn lỗi nhỏ:** `TaxForm` / `ShippingSettings` khởi tạo state từ `initialData` chỉ lúc mount — quay lại bước trước đổi toggle rồi tiến lại có thể không sync UI.
  - Sửa: `key={currentStep}` remount form, hoặc `useEffect` sync khi `initialData` đổi.

- [x] **[25-D] Redirect sau submit gây loop `/seller`**
  - ✅ `navigate("/", { replace: true })`

- [x] **[25-E] Không có UI REJECTED / NEED_MORE_INFO**
  - ✅ Block hiển thị `application.note` + cho nộp lại (`create/index.tsx` ~242)

- [x] **[25-F] `get_my_application` không có ordering — `backend`**
  - ✅ `order={"createdAt": "desc"}` trong `seller_service.py`

---

## 🔴 Lỗi CRITICAL — chưa sửa (audit 2026-05-18)

> Ưu tiên cao nhất trước demo / bảo vệ.

- [x] **[26] Giá & tổng tiền do client gửi, BE tin tưởng — `backend` + `user-fe`**
  - BE: `order_service.py` `create_order` / `checkout` dùng `item.price`, `subtotal`, `discountAmount`, `totalAmount` từ request (~239, 473, 521–524).
  - FE: `checkout/index.tsx` gửi số đã tính trên client.
  - **Hậu quả:** DevTools có thể đặt hàng giá 0 / giảm giá tùy ý → MoMo/VNPay thanh toán số sai.
  - **Sửa:** BE tính lại từ `Product`/`ProductVariant`, shipping rules, `CouponService.calculate_discount`; FE chỉ hiển thị quote từ API preview.

- [x] **[27] Coupon UI không hoạt động — contract FE/BE lệch — `user-fe`**
  - File: `coupon/components/couponInput.tsx` — kiểm tra `validation?.valid` và `validation?.discountAmount`.
  - BE `GET /coupons/validate/{code}/{amount}` trả **object coupon** (`coupon_service.validate_coupon`), không có field `valid`.
  - **Hậu quả:** Voucher gần như không áp dụng được (luôn "không hợp lệ").
  - **Sửa:** Sau validate, gọi `GET /{couponId}/discount/{orderAmount}` hoặc map coupon → `calculate_discount` trên FE; bỏ check `.valid`.

- [x] **[28] Tạo review gửi FormData, BE chỉ nhận JSON — `user-fe` + `backend`**
  - FE: `review/api/create-review.ts` — multipart + field `images`.
  - BE: `review_router.py` — `ReviewCreate` JSON + `mediaUrls: string[]`.
  - **Hậu quả:** "Viết đánh giá" → 422; ảnh không upload lên URL.
  - **Sửa:** Upload ảnh trước → POST JSON `{ ..., mediaUrls }` hoặc thêm endpoint multipart ở BE.

- [x] **[29] `POST /orders/` (`create_order`) bypass validation coupon — `backend`**
  - File: `order_service.py` ~347–381 — chỉ check coupon tồn tại + increment `usedCount`.
  - Không check: active, date, `usageLimit`, `minOrderAmount`, `applicableShopId`; không tạo `CouponRedemption` đầy đủ như `checkout`.
  - **Sửa:** Dùng chung `validate_coupon` + `use_coupon` trong transaction; hoặc deprecate `create_order` cho buyer.

- [x] **[30] `PATCH /coupons/use/{coupon_id}` — drain coupon không cần đơn — `backend`**
  - File: `coupon_router.py` ~29–32 — bất kỳ user đăng nhập có thể tăng `usedCount`.
  - **Sửa:** Xóa endpoint public hoặc require `order_id` + chỉ gọi nội bộ từ order service.

- [x] **[31] Payment callback không idempotent — `backend`**
  - File: `payment_service.py` `_update_gateway_callback` ~242–257 — không skip nếu payment đã `SUCCESS`; callback `FAILED` sau có thể ghi đè.
  - **Hậu quả:** Order `PAID` + payment `FAILED` lệch trạng thái.
  - **Sửa:** Nếu terminal state → no-op; verify `amount` == `payment.amount`.

- [x] **[32] MoMo tạo payment không check `resultCode` — `backend`**
  - `order_service.py` checkout trong transaction gọi gateway; lỗi MoMo vẫn có thể persist payment `PENDING`.
  - **Sửa:** Check `resultCode == 0` trước khi `payment.create`; đưa HTTP gateway **ra ngoài** transaction.

---

## 🟠 Lỗi HIGH — chưa sửa

### Backend

- [x] **[33] Checkout thiếu validate coupon đầy đủ** — không check `isActive`, dates, global `usageLimit`, `minOrderAmount`, `applicableShopId`; không validate `discountAmount`/`totalAmount` (`order_service.py` ~531–560).
- [x] **[34] Race coupon limits** — read-then-increment, không `update_many` có điều kiện `usedCount < usageLimit`.
- [x] **[35] Đơn không `variantId` bỏ qua stock** — oversell (`order_service.py` ~283–318).
- [x] **[36] `variantId`/`shopId` không verify khớp `productId`** — sai shop/commission.
- [x] **[37] Hủy đơn `PAID` không hoàn tiền** — `CANCELLABLE_STATUSES` có `PAID`, chỉ restore stock.
  - ✅ Đã sửa: bỏ `PAID` khỏi luồng hủy, chặn hủy order có payment `SUCCESS` nếu chưa refund, ghi `OrderCancellation`.
- [x] **[38] `POST /analytics/track` không auth, spoof `userId`** — `analytics_router.py` ~10–12.
- [x] **[39] Coupon public list lộ `orders`** — `GET /coupons/`, `GET /coupons/{id}` không auth.
- [x] **[40] `create_payout` không check `availableBalance`** — `finance_service.py`.
- [x] **[41] Admin `PATCH /orders/{id}/payment` dùng `OrderUpdate` thay vì `PaymentUpdate`** — `order_router.py` ~143–157.
- [x] **[42] Đổi mật khẩu không revoke refresh token** — `auth/service.py`.
- [x] **[43] Gateway HTTP trong DB transaction** — `checkout` `async with prisma.tx()`.
  - ✅ Đã sửa: checkout chỉ tạo order/payment trong transaction; gọi MoMo/VNPay sau transaction và đánh `PAYMENT_FAILED` nếu gateway lỗi.

### user-fe

- [x] **[44] Login redirect: `from` vs `redirect`**
  - `guards.tsx` set `state.from`; `login-form.tsx` chỉ đọc `state.redirect` → sau login từ `/checkout` về `/` thay vì trang cũ.
  - **Sửa:** `location.state?.redirect ?? location.state?.from ?? "/"`.

- [x] **[45] Payment success chỉ parse MoMo, bỏ qua VNPay**
  - File: `payment-success/index.tsx` — `resultCode`, `orderId` (MoMo).
  - VNPay dùng `vnp_ResponseCode`, `vnp_TxnRef`, …

- [x] **[46] Checkout MoMo: "Tôi đã thanh toán" không verify**
  - `checkout/index.tsx` — không poll `GET /orders/payment/order/{id}`; user tưởng đã trả tiền khi order còn `PENDING`.

- [x] **[47] `totalWithDiscount` có thể âm** — không `Math.max(0, …)` trước khi gửi API.

- [x] **[48] Shipping method không persist** — FE chỉ gửi `shippingFee`, không gửi method (`STANDARD`/`EXPRESS`/…).
  - ✅ Đã sửa: thêm `shippingMethod` vào Prisma/BE schema, checkout payload, mapper và admin order detail.

- [x] **[49] Checkout dual auth** — `RequireAuth` + `getStoredStorefrontUser()` có thể lệch session vs localStorage.
  - ✅ Đã sửa: checkout dùng Zustand auth store đã sync từ `auth/me`, không tự đọc user từ localStorage nữa.

- [x] **[50] Order detail: cancel UX không nhất quán**
  - `order-detail` cho cancel nhiều status; `orderAction.tsx` chỉ `pending`.

- [x] **[51] Product không variant → stock hiển thị 0** — `useProductDetail.tsx`.
- [x] **[52] "Mua ngay" không có handler** — `product/components/Action.tsx`.

### admin-FE

- [x] **[53] Admin hủy đơn dùng API customer-only**
  - `orders/view` → `PATCH /orders/{id}/cancel` — BE chỉ hủy đơn của chính user đó → admin 404.
  - **Sửa:** Dùng `PATCH /orders/{id}` status `CANCELLED` (đã có) hoặc endpoint admin riêng; bỏ/đổi nút trash.

- [x] **[54] Analytics revenue đếm cả đơn cancelled**
  - `analytics/view/index.tsx` `buildRevenueData` — không lọc status; lệch với finance API (DELIVERED/COMPLETED).

- [x] **[55] Order list cột Shop luôn "N/A"**
  - Map `o.shop?.name` nhưng admin API không có `shop` top-level — shop nằm ở `items[].shop`.

- [x] **[56] Giới hạn 1000 đơn im lặng** — `get-all-orders.ts` `limit: 1000`, không pagination.
  - ✅ Đã sửa: admin orders dùng server pagination `{page, limit, total}`, DataTable nhận `total/page/onPageChange`.

- [x] **[57] Order stats / Category stats hardcode**
  - `order-stats.tsx`, `category-stats.tsx` — số giả (2,450 đơn, 125 danh mục, …).

- [x] **[58] Shop cột "Danh mục" hiển thị `description`**
- [x] **[59] Shop filter "Chờ duyệt" không khớp data** — chỉ `active`/`suspended`.
- [x] **[60] Product REJECTED không re-approve từ UI** — chỉ approve khi `DRAFT`.
- [x] **[61] Category create thiếu slug bắt buộc** — BE require, FE optional.
- [x] **[62] Bulk approve: partial failure + select theo page**
  - ✅ Đã sửa: bulk approve dùng `Promise.allSettled`, báo số thành công/thất bại; DataTable clear selection khi đổi page/data.

---

## 🟢 Lỗi MEDIUM — có thể trả lời hội đồng

- [x] **[63]** `shipment_service.py` so sánh `role != "SELLER"` string thay vì `get_role_value()`.
- [x] **[64]** Review public detail lộ email — `GET /reviews/detail/{id}`.
- [x] **[65]** `unfollow_shop` 500 khi chưa follow; `follow_shop` không check shop tồn tại.
- [x] **[66]** Finance `grossRevenue` / seller report tính cả đơn chưa hoàn tất.
  - ✅ Đã sửa: revenue/top products chỉ tính `DELIVERED`/`COMPLETED`; pending/refund/cancel tách riêng.
- [x] **[67]** Admin order detail modal dữ liệu đã map (thiếu line items, payment).
  - ✅ Đã sửa: modal dùng raw order, hiển thị line items, payment, shipping method và cancellation.
- [x] **[68]** Product price column `/1000` → `K` có thể sai đơn vị VND.
- [x] **[69]** Analytics top products hiển thị `price` thay vì revenue/ranking.
- [x] **[70]** `add-category.ts` parse `response.data.data` sai shape.
- [x] **[71]** Checkout xóa `sessionStorage` ngay sau đặt hàng — refresh ở bước QR mất context.
- [x] **[72]** Access token TTL ~7 ngày (`security.py`) — window lớn nếu token lộ.

---

## 🔴 CRITICAL — Audit lần 2 (mới phát hiện)

- [x] **[73] WebSocket notification: JWT không validate đúng — `backend`**
  - File: `BE/src/modules/notification/notification_router.py` ~20–24
  - `decode_token(token)["sub"]` — không check `type==access`, không handle token hết hạn (`None`), không verify user còn active.
  - **Hậu quả:** Subscribe nhầm channel user khác nếu lộ token; crash khi token invalid.

- [x] **[74] Cart optimistic update sai React Query key — `user-fe`**
  - `get-my-cart.ts`: `queryKey: ["cart", user?.id]`
  - `update-cart.ts` / `add-item.ts`: invalidate/optimistic dùng `["cart"]` (thiếu `user.id`)
  - **Hậu quả:** Đổi số lượng giỏ hàng UI không cập nhật / rollback sai cache.

- [x] **[75] Đăng ký lưu token nhưng đẩy về login — `user-fe`**
  - `register.ts` `onSuccess` → `saveStorefrontSession(token, user)`
  - `register-form.tsx` → `navigate('/login')`, **không** `setUser` Zustand
  - **Hậu quả:** localStorage có token, UI coi như chưa đăng nhập; lệch với header/`useMe`.

- [x] **[76] Admin trang Reviews luôn rỗng — `admin-FE`**
  - `review/view/index.tsx`: `reviews = data?.data?.data || []`
  - BE `GET /reviews/` trả **mảng trực tiếp**, không bọc `{ data: { data } }`
  - **Hậu quả:** Admin không duyệt/quản lý review được dù API có data.

---

## 🟠 HIGH — Audit lần 2 (Backend)

- [x] **[77] Public shop API lộ email chủ shop — `backend`**
  - `GET /shops/`, `GET /shops/{id}` — `ShopOut.owner.email` không cần auth.

- [x] **[78] Tracking vận chuyển public theo mã — `backend`**
  - `GET /shipments/track/{tracking_number}` — lộ `orderId`, carrier, status; enumerable.

- [x] **[79] Support ticket: user/seller có thể PATCH `assignedAdminId`, `status` — `backend`**
  - `support_service.update_ticket` — non-admin vẫn `model_dump` full `SupportTicketUpdate`.

- [x] **[80] Cart: `shopId`/`variantId` client gửi, không đối chiếu product — `backend`**
  - `cart_service.add_item` — không verify `variant.productId`, `product.shopId == shopId`.

- [x] **[81] Return multi-shop: seller `mark_refunded` kẹt — `backend`**
  - ✅ Đã sửa: return request mới bị giới hạn một shop/lần; tránh trạng thái global bị kẹt trên return multi-shop.
  - Một return nhiều shop → sau admin approve, seller refund từng shop fail `len(seller_items) != len(items)`.

- [x] **[82] Return: cả order → `RETURN_REQUESTED` dù 1 dòng — `backend`**
  - ✅ Đã sửa: chỉ set order `RETURN_REQUESTED/RETURNED` khi toàn bộ line item được cover bởi return active.
  - `return_service.create_request` ~151–154 — ảnh hưởng đơn còn lại.

- [x] **[83] Production không có CORS middleware — `backend`**
  - `main.py` — `CORSMiddleware` chỉ khi `DEBUG=True`.

- [x] **[84] Access token bỏ qua `ACCESS_TOKEN_EXPIRE_MINUTES` — `backend`**
  - `security.create_access_token` default 10080 phút (~7 ngày); config ghi 60 phút không dùng.

- [x] **[85] `GET /products/variants/images/{image_id}` sai tham số — `backend`**
  - Router truyền `image_id` vào `get_variant_images(variant_id)` → query theo `variantId`, không phải `id` ảnh.

- [x] **[86] Admin filter `SellerFilter.isVerified` — field không tồn tại — `backend`**
  - `admin_service.get_sellers` filter `isVerified` nhưng `Shop` schema không có cột → Prisma error nếu gửi filter.

- [x] **[87] Refund return chỉ đổi status DB — không hoàn tiền gateway — `backend`**
  - ✅ Đã sửa: chặn mark `REFUNDED` cho MoMo/VNPay/Stripe đã `SUCCESS` nếu chưa có gateway refund, không còn đổi status DB giả.
  - `mark_refunded` không gọi MoMo/VNPay refund API.

- [x] **[88] Chatbot: `history` client gửi vào prompt LLM — `backend`**
  - Prompt injection / override instruction khi Ollama bật.

- [x] **[89] Upload: không giới hạn size; `folder` client chỉ định — `backend`**
  - `cloudinary.py` + `upload_router` — DoS / abuse namespace Cloudinary.

- [x] **[90] `model.pkl` retrain race (multi-worker) — `backend`**
  - `ai/schedule.py` ghi file không lock.

- [x] **[91] User soft-delete: JWT/refresh vẫn dùng được — `backend`**
  - `delete_user` set `deletedAt`, không revoke refresh tokens.

- [x] **[92] Inventory ledger lỗi bị nuốt — `backend`**
  - `inventory_service.record` try/except pass — mất audit trail tồn kho.

---

## 🟠 HIGH — Audit lần 2 (user-fe)

- [x] **[93] Header badge giỏ hàng luôn 0 — `user-fe`**
  - `header.tsx`: `user?.cart?.itemCount`
  - BE `auth/me`: `cart.totalItems` — **sai tên field**.

- [x] **[94] Return form: tên SP trống — `user-fe`**
  - `returnRequestForm.tsx`: `item.productName`
  - Order mapper: `product_name` — field lệch.

- [x] **[95] Seller coupon list luôn trống — `user-fe`**
  - `seller/view/coupons/index.tsx`: `couponsData?.data?.data`
  - BE trả array thẳng — giống lỗi admin reviews **[76]**.

- [x] **[96] Dual auth: Zustand vs `auth-storage` — `user-fe`**
  - ✅ Đã sửa: `auth/me`, `users/me`, update profile và store cùng sync Zustand + auth-storage.
  - Login set cả hai; checkout/Action dùng storage; product-detail dùng Zustand → gate lệch.

- [x] **[97] Logout/refresh fail không clear Zustand — `user-fe`**
  - `logout.ts`, `api.ts` interceptor — chỉ `clearStorefrontSession()`.

- [x] **[98] Refresh queue: request xếp hàng có thể treo — `user-fe`**
  - `lib/api.ts` ~34–40 — khi refresh fail, waiter không reject rõ.

- [x] **[99] Không có guest cart / merge sau login — `user-fe` + `backend`**
  - ✅ Đã sửa: thêm guest cart localStorage; ProductCard/Action lưu item guest và merge lên API cart sau login/register.
  - Cart bắt buộc auth; `ProductCard` add không check login.

- [x] **[100] `useGetNotifications` không `enabled: !!user` — `user-fe`**
  - 401 loop khi token hết hạn trên seller layout.

- [x] **[101] Account dùng `users/me`, guard dùng `auth/me` — `user-fe`**
  - ✅ Đã sửa: account/profile sync store sau `users/me`; guard và account không còn lệch dữ liệu session.
  - Hai nguồn profile; update một nơi không sync Zustand.

- [x] **[102] Seller payout UI không bắt lỗi — `user-fe`**
  - `seller/view/finance/index.tsx` `submitPayout` không try/catch.

- [x] **[103] ProductCard add-to-cart không check đăng nhập — `user-fe`**
  - Khác `Action.tsx` — guest chỉ thấy lỗi 401 chung.

- [x] **[104] Catalog load full rồi filter client — `user-fe`**
  - ✅ Đã sửa: product API nhận `page/limit/search/category_id`; catalog FE gọi server query giới hạn thay vì load toàn bộ.
  - `product/view/index.tsx` — không pagination server; scale kém.

- [x] **[105] Header search không nối `/products` — `user-fe`**

- [x] **[106] Buyer return history: API có, UI không — `user-fe`**
  - ✅ Đã sửa: thêm route `/returns` cho buyer, menu header và bảng lịch sử return.
  - `get-return.ts` `useUserReturnRequests` — không có route/page.

---

## 🟠 HIGH — Audit lần 2 (admin-FE)

- [x] **[107] Dashboard widgets mock (trừ số KPI chính) — `admin-FE`**
  - ✅ Đã sửa: dashboard BE trả revenue/category/pending/top shops/recent activity; widgets admin dùng dữ liệu API.
  - `revenue-chart`, `pending-shops`, `pending-products`, `recent-activity`, `top-shops` — hardcode/demo.

- [x] **[108] Route `/notifications` trong sidebar không tồn tại — `admin-FE`**
  - `admin-sidebar.tsx` href `/notifications` — không có trong `routes/index.tsx`.

- [x] **[109] Admin approve product bỏ qua `PATCH /admin/products/{id}/status` — `admin-FE`**
  - Dùng `PATCH /products/{id}` — thiếu audit/notification moderation của admin endpoint.

- [x] **[110] Khóa user chỉ `PATCH users isActive` — không dùng `ban/unban` — `admin-FE`**
  - BE `ban` còn deactivate shop seller + notify + audit.

- [x] **[111] Promotions (coupons) read-only UI — nút sửa/tắt không handler — `admin-FE`**
  - ✅ Đã sửa: thêm handler tạo coupon, sửa mô tả, bật/tắt coupon và invalidate query.

- [x] **[112] Settings → Security tab UI-only (2FA, maintenance) — `admin-FE`**
  - ✅ Đã sửa: Security tab dùng API security incidents thật và có action resolve.
  - Không gọi `API_URL_SECURITY`; thật sự ở `/violations`.

- [x] **[113] Role guard client-only — `protectedGuard.tsx`**
  - Chỉ đọc `localStorage` role; không gọi `auth/admin/me` khi vào app.

- [x] **[114] `home/api/get_orders.ts` dead code + sai body — `admin-FE`**
  - ✅ Đã sửa: body đúng contract `{ filter_data, pagination }`.
  - Không ai import; body flat thay vì `filter_data` + `pagination`.

- [x] **[115] Dead API modules (register, address, create-order, …) — `admin-FE`**
  - ✅ Đã sửa: xóa các module API admin không được import và dễ tái sử dụng sai contract.
  - Rủi ro tái sử dụng nhầm contract.

---

## 🟢 MEDIUM — Audit lần 2

- [x] **[116]** Cart `update_item` không re-check stock (TOCTOU) — `cart_service.py`
- [x] **[117]** Wishlist không chặn product `BANNED`/`DRAFT` — `wishlist_service.py`
- [x] **[118]** `POST /audit/track` spoof / spam — `audit_router.py`
- [x] **[119]** Rate limit + IP blacklist in-memory — không scale multi-worker
  - ✅ Đã sửa: rate limit/IP blacklist ưu tiên Redis key TTL, chỉ fallback memory khi Redis lỗi.
- [x] **[120]** Prisma: `ProductStatus.APROVAL` typo; `CartItem` thiếu `onDelete`; `Coupon.applicableShopId` không FK
  - ✅ Đã sửa: schema dùng `APPROVAL`, thêm `onDelete` cho `CartItem`, FK `Coupon.applicableShopId`, migration kèm theo.
- [x] **[121]** `permision.py` import path sai — middleware chết
- [x] **[122]** Admin: `QueryClient` trong `main.tsx` không dùng config `react-query.ts`
- [x] **[123]** Admin: dual profile `auth/admin/me` vs `users/me`
  - ✅ Đã sửa: admin profile đọc `auth/admin/me`, update profile vẫn invalidate chung query auth.
- [x] **[124]** user-fe: `RequireSeller` `"SELLER"` vs constant `"seller"`
- [x] **[125]** user-fe: `order-detail` complete gửi `"completed"` lowercase — phụ thuộc BE normalize
- [x] **[126]** user-fe: `VITE_API_URL` không validate — `undefined` baseURL
- [x] **[127]** Admin finance: không UI payout approve (`PATCH /finance/payout/{id}`)
  - ✅ Đã sửa: thêm endpoint list payout admin và page `/finance` approve/reject payout.
- [x] **[128]** Schema có **FlashSale**, **OrderCancellation**, **Banner** — không router/UI admin
  - ✅ Đã sửa: thêm FlashSale router, OrderCancellation record + hiển thị trong order modal, trang admin `/marketing` quản lý Banner/FlashSale.

---

## 📦 Tính năng marketplace (schema / triển khai)

| # | Tính năng | Schema/API BE | user-fe | admin-fe | Ghi chú |
|---|-----------|---------------|---------|----------|---------|
| 26 | Wishlist | ✅ `/wishlist` | ✅ Trang + nút tim product card | — | Đã thêm `/wishlist` |
| 27 | Chat buyer ↔ seller | ✅ module `chat` | ❌ Không có module | — | Chỉ chatbot AI, không chat seller |
| 28 | Review ảnh/video | ✅ `mediaUrls` + `/uploads/media` | ✅ Upload ảnh/video rồi gửi `mediaUrls` | — | |
| 29 | Seller reply review | ✅ API | ✅ `/seller/reviews` | — | |
| 30 | `usageLimitPerUser` + redemption | ✅ | ✅ Coupon validate/discount đồng bộ hơn | — | |
| 31 | Flash sale | ✅ model + router | ✅ `/promotions`/`/flash-sale` | ✅ `/marketing` | |
| 32 | ShipmentEvent | ✅ API | ✅ Timeline order detail | — | |
| 33 | Pagination list lớn | ⚠️ Một phần | ⚠️ Catalog có server query | ✅ Admin orders pagination | |
| 34 | Export Excel/CSV admin | ❌ | — | ❌ | Nice-to-have |
| 35 | Banner / Marketing admin | ✅ `/marketing` | ✅ Banner promotions | ✅ Page + form banner | Admin form không còn `window.prompt` |
| 36 | Flash sale | ✅ model + router | ✅ Flash-sale page/cards | ✅ Page + form flash sale/item | |
| 37 | Seller payout duyệt | ✅ `PATCH /finance/payout` | — | ✅ `/finance` approve/reject | |
| 38 | Inventory ledger admin | ✅ `/inventory` | — | ✅ `/inventory` ledger | |
| 39 | Real-time notification | ✅ WS + REST auth token | ✅ Notification bell | ✅ `/notifications` thật | |

---

## 🗺️ Ma trận luồng end-to-end (để demo / bảo vệ)

| Luồng | BE | user-fe | admin-fe | Rủi ro demo |
|-------|----|---------|----------|-------------|
| Đăng ký → mua hàng | OK | ⚠️ **[75]** token/storage lệch | — | User đăng ký xong bị đẩy login |
| Thêm giỏ → checkout | ⚠️ cart integrity **[80]** | ⚠️ query key **[74]**, badge **[93]** | — | Số lượng giỏ không đổi UI |
| Coupon checkout | ⚠️ trust client **[26]** | ❌ **[27]** | — | Voucher không apply |
| MoMo/VNPay | ⚠️ callback **[31]** | ⚠️ **[45][46]** | — | Bấm "đã thanh toán" ảo |
| Review sản phẩm | OK read | ❌ create **[28]** | ❌ list **[76]** | Không viết/duyệt review |
| Return hàng | ⚠️ multi-shop **[81]** | ⚠️ tên SP **[94]** | OK returns page | Tên trống trong form |
| Seller coupon | OK | ❌ **[95]** | read-only **[111]** | Seller thấy 0 coupon |
| Notification realtime | ⚠️ WS **[73]** | ⚠️ | 404 **[108]** | Chuông không hoạt động |
| Admin hủy đơn | customer-only cancel | — | ❌ **[53]** | Nút hủy fail 404 |

---

## 🎯 Câu hỏi hội đồng — Chuẩn bị sẵn

| Câu hỏi | Câu trả lời (thật, sau audit lần 2) |
|---------|--------------------------------------|
| Scalability? | Redis product cache; cart/order không cache; catalog FE load all; rate limit in-memory. |
| Search? | `ILIKE` — không full-text. Header search chưa nối catalog (**[105]**). |
| Recommendation? | Item-CF + behavior + co-purchase; train 6h; `model.pkl` race multi-worker (**[90]**). |
| Chatbot? | RAG + Ollama; history client → prompt risk (**[88]**). |
| Bảo mật? | Refresh rotation, lock login. **Lỗ hổng:** client pricing, WS notification, public shop email, analytics/audit spoof, coupon `/use`, CORS prod off. |
| Commission? | Shop → Category → 10%. Payout không check balance (**[40]**). |
| Race stock? | Atomic chỉ có `variantId`; cart update không re-check (**[116]**). |
| Real-time? | Socket.IO/WS notifications — auth yếu (**[73]**). |
| Deploy production? | `DEBUG` default True; CORS chỉ dev (**[83]**); cần `.env` `COOKIE_SECURE`, `CORS_ORIGINS`. |
| Dữ liệu PII? | Shop owner email public (**[77]**); review detail lộ email (**[64]**). |

---

## 📊 Đánh giá tổng thể (sau audit lần 2)

```
Nghiệp vụ e-commerce:      ██████░░░░  6/10  ↓ return/cart/checkout
Bảo mật & auth:            █████░░░░░  5/10  ↓ WS, pricing, public PII
Data model & schema:        ████████░░  8/10  ↓ orphan models, typo enum
Backend architecture:       ██████░░░░  6/10
Frontend logic (user-fe):   █████░░░░░  5/10  ↓ cart cache, auth drift
Frontend logic (admin-fe):  █████░░░░░  5/10  ↓ reviews, mock widgets
Seller portal:              ██████░░░░  6/10  ↓ coupon list, payout UX
AI Recommendation:          ████████░░  8/10
Chatbot:                    ████████░░  8/10  ↓ prompt injection surface
Hiệu năng & scalability:    ████░░░░░░  4/10  ↓ full catalog, no pagination
Tính đồng bộ FE↔BE:        █████░░░░░  5/10  ↓ nhiều response shape sai
```

**Tổng số mục chưa sửa (ước lượng):** **0** checkbox còn mở trong danh sách audit chính **[26]** đến **[128]**.

**Top 10 lỗi “chết demo”:**
1. **[27]** Coupon không apply
2. **[26]** Giá client (hội đồng security)
3. **[74][93]** Giỏ hàng UI sai
4. **[28]** Không gửi được review
5. **[76]** Admin không thấy review
6. **[53]** Admin không hủy được đơn
7. **[31]** Payment callback
8. **[75]** Đăng ký → login lệch session
9. **[73]** Notification WS (nếu demo realtime)
10. **[95]** Seller không thấy coupon

---

## ✅ Thứ tự sửa đề xuất (3–5 ngày)

### Ngày 1 — Demo mua hàng được
1. **[27][95][76]** Sửa parse API (coupon, seller coupons, admin reviews) — cùng pattern `array vs .data.data`
2. **[74][93]** Cart query key + `totalItems` → header
3. **[75][96][97]** Thống nhất auth (một nguồn, register → auto login)

### Ngày 2 — Tin cậy tiền / đơn
4. **[26][29][30]** Server pricing + khóa coupon bypass
5. **[31][32]** Payment idempotent + MoMo resultCode
6. **[53][54][55]** Admin orders + analytics filter

### Ngày 3 — Bảo mật & polish
7. **[73][77][83]** WS auth, ẩn email shop, CORS prod
8. **[28][94]** Review + return form fields
9. **[44][45][46]** Login redirect + payment UX

### Backlog trước bảo vệ
10. **[80][81][79]** Cart integrity, return multi-shop, support ticket ACL
11. **[107][108][111]** Admin mock widgets / route notifications / coupons CRUD

---

*File này là nguồn truth cho tiến độ sửa lỗi. Khi sửa xong một mục: đổi ô trống sang `[x]` và thêm dòng ✅ ngắn gọn.*

---

## ✅ Cập nhật Codex 2026-05-18

- ✅ Sửa contract FE/BE: coupon checkout, seller coupon list, admin review list, review upload JSON `mediaUrls`.
- ✅ Sửa cart/auth demo: query key giỏ hàng theo user, header `cart.totalItems`, register auto-login, logout/refresh fail clear Zustand, login redirect `from`.
- ✅ Sửa checkout/payment: BE tính lại giá từ DB, validate variant/shop, validate coupon đầy đủ hơn, clamp total FE, giữ session QR, nút “Tôi đã thanh toán” verify payment status.
- ✅ Sửa payment backend: callback idempotent, verify amount, check MoMo `resultCode`, admin payment route dùng `PaymentUpdate`.
- ✅ Sửa admin orders/analytics: admin hủy bằng update status, cột shop từ `items[].shop`, revenue chỉ tính delivered/completed.
- ✅ Sửa security/backend: WS notification validate access token + user active, CORS dùng config trong production, access token TTL dùng `ACCESS_TOKEN_EXPIRE_MINUTES`, ẩn email owner shop, shipment tracking cần auth, support ticket non-admin không PATCH status/assignedAdminId, cart verify shop/variant và re-check stock update, payout check available balance.
- ✅ Verification: `BE` compileall pass, `user-fe` build pass, `admin-FE` build pass.

## ✅ Cập nhật Codex 2026-05-19

- ✅ Backend: siết auth cho analytics/audit/coupon list, revoke refresh token khi đổi mật khẩu/xóa user, coupon increment có điều kiện, ẩn email review/shop public, upload giới hạn size/folder, follower/wishlist validate, shipment dùng `get_role_value`, sửa variant image route, seller filter bỏ field không tồn tại, chatbot không đưa history client vào prompt, retrain model ghi file atomic, inventory ledger không nuốt lỗi.
- ✅ user-fe: notification query chỉ chạy khi có user, return form fallback tên sản phẩm, product detail fallback stock không variant, payment success parse VNPay, seller payout bắt lỗi, header search nối `/products`, order detail gửi `COMPLETED`, validate `VITE_API_URL`.
- ✅ admin-FE: thêm route `/notifications`, dùng queryClient config chung, admin product status dùng endpoint admin, user ban/unban dùng endpoint đúng, category create bắt buộc slug và parse response đúng, product price hiển thị VND, analytics top products hiển thị ranking, shop column không dùng description làm danh mục, product REJECT có thể approve lại.
- ✅ Verification: `BE` compileall pass, `user-fe` build pass, `admin-FE` build pass.

## ✅ Cập nhật Codex 2026-05-19 (bổ sung)

- ✅ Sửa thêm: seller registration remount shipping/tax step, đồng bộ cancel UX order detail/list, bỏ filter shop pending không có dữ liệu, order/category stats dùng dữ liệu thật, thêm alias `permission.py`, role seller normalize hoa/thường.
- ✅ Verification bổ sung: `BE` compileall pass, `user-fe` build pass, `admin-FE` build pass.

## ✅ Cập nhật Codex 2026-05-19 (hoàn tất checklist còn mở)

- ✅ Backend: chặn hủy/refund giả cho payment đã thành công, đưa MoMo/VNPay ra ngoài DB transaction, persist `shippingMethod`, fix return partial/single-shop, finance revenue chỉ tính đơn hoàn tất, Redis-backed rate limit/IP blacklist, schema Prisma `APPROVAL` + FK/onDelete + migration.
- ✅ Backend orphan schema: thêm FlashSale router, sửa Banner schema/router contract, ghi `OrderCancellation` khi hủy và trả cancellation trong admin orders.
- ✅ user-fe: thống nhất auth store/storage, checkout không đọc user localStorage riêng, guest cart + merge sau login/register, catalog dùng server query giới hạn, thêm buyer return history `/returns`.
- ✅ admin-FE: orders pagination thật, order detail có line items/payment/cancellation, bulk approve partial failure, dashboard widgets dùng API thật, promotions có create/edit/toggle, security settings dùng incidents API, xóa dead API modules, admin profile dùng `auth/admin/me`, thêm payout approve `/finance`, thêm marketing `/marketing`.
- ⚠️ Lỗi phát sinh khi verify và đã xử lý: PowerShell chặn `npm.ps1` nên build lại bằng `npm.cmd`; TypeScript bắt lỗi `Button asChild`, hook return history config, và analytics chưa unwrap response pagination.
- ✅ Verification: `BE` compileall pass, `npx prisma validate` pass, `user-fe` build pass, `admin-FE` build pass.

## ✅ Cập nhật Codex 2026-05-20 (logic nghiệp vụ demo thật)

- ✅ Backend order: thêm `OrderShopPackage` + migration, mỗi shop trong đơn có `status`, tracking/shipment fields riêng; seller update chỉ đổi package của shop mình, không còn cập nhật toàn bộ đơn multi-shop.
- ✅ Backend payment/order: payment success/failure sync trạng thái package; admin/customer update toàn đơn vẫn đồng bộ package; seller view nhận `shopPackage` và status theo shop.
- ✅ Backend return/refund: endpoint add item kiểm tra single-shop, duplicate, active return khác và số lượng còn lại; thêm tracking gateway refund (`gatewayRefundStatus`, transaction id) + endpoint admin `/returns/{id}/gateway-refund`.
- ✅ Backend review: chỉ buyer có đơn `DELIVERED/COMPLETED` chứa sản phẩm mới được review; rating bị giới hạn 1–5.
- ✅ Backend/FE coupon: validate voucher nhận `shopIds`, chặn voucher shop sai ngay ở UI validate thay vì đợi checkout fail; discount endpoint mới cũng validate cùng context.
- ✅ Backend flash sale: checkout/create order lấy `FlashSaleItem.salePrice` khi flash sale active, kiểm tra `stockLimit`/`purchaseLimit`, tăng `soldCount` bằng update có điều kiện.
- ✅ Admin orders: backend search tìm theo order id, customer và shop trên toàn bộ dataset; FE không còn lọc lại trên page hiện tại; bỏ transition `PAID -> CANCELLED` ở admin UI.
- ✅ Product catalog/config/text: product API nhận cả `categoryId/category_id`, catalog gửi filter server-side nhiều hơn; admin `VITE_API_URL` được normalize dấu `/`; sửa chuỗi guest cart bị mojibake ở product action/card.
- ⚠️ Lỗi phát sinh khi verify và đã xử lý: `npx prisma generate` mặc định bị lệch Prisma CLI version với `prisma-client-py`; đã regenerate bằng `npx prisma@5.17.0 generate`. Vite build vẫn cảnh báo chunk lớn >500kB nhưng không fail.
- ✅ Verification: `BE` compileall pass, `npx prisma validate` pass, Prisma client có `ordershoppackage`, `user-fe` build pass, `admin-FE` build pass.

## ✅ Cập nhật Codex 2026-05-20 (bổ sung front-end theo API mới)

- ✅ user-fe checkout/coupon: `CouponInput` gửi `shopIds` vào validate/discount, checkout truyền danh sách shop từ item đang thanh toán để voucher shop sai bị chặn ngay trước khi đặt hàng.
- ✅ user-fe seller order: seller list/detail đọc `shop_package`, hiển thị tracking riêng theo shop và gọi create/update shipment theo package khi đơn nhiều shop.
- ✅ user-fe flash sale: product list/home card/product detail đọc `activeFlashSale`, hiển thị giá sale + giá gốc gạch ngang; hook detail đổi giá theo variant sale nếu có.
- ✅ Backend cache flash sale: invalidate cả product list/shop/detail cache khi flash sale item hoặc trạng thái flash sale đổi, tránh trang chi tiết giữ giá cũ.
- ✅ admin-FE flash sale/return/order: marketing có thêm item flash sale và bật/tạm dừng; returns có nút xác nhận gateway refund; orders bỏ filter client-side theo page và bỏ transition `PAID -> CANCELLED`.
- ✅ Front-end polish: sửa chuỗi mojibake ở checkout, product action/card, seller order, admin return/marketing; chuẩn hóa import `productcard` để tránh lỗi case-sensitive khi build.
- ⚠️ Lỗi phát sinh khi verify và đã xử lý: `user-fe` build fail `TS1261` do import `productCard` lệch casing với file `productcard.tsx`; đã sửa import về đúng casing. PowerShell hiển thị sai UTF-8 không BOM khi `Get-Content`, đã kiểm lại nội dung bằng Node theo UTF-8/codepoint.
- ✅ Verification bổ sung: `python -m compileall BE\src` pass, `npx prisma validate` pass, `npm.cmd run build` pass ở `user-fe`, `npm.cmd run build` pass ở `admin-FE`, `git diff --check` không có whitespace error.

## ✅ Cập nhật Codex 2026-05-20 (variant image upload)

- ✅ user-fe seller product: mỗi dòng variant trong bước bán hàng có nút upload ảnh riêng từ máy; vẫn cho chọn ảnh product có sẵn nếu muốn.
- ✅ user-fe seller product: ảnh variant upload được lưu vào `variant.imageUrl` và gửi lên backend qua `variants[].images[]` khi tạo sản phẩm.
- ✅ user-fe upload: đổi folder upload product/variant về `products`, khớp whitelist backend `/uploads/image`.
- ✅ user-fe product detail: normalize `variant.images` từ backend thành `variantImages`; khi người dùng chọn variant, gallery ưu tiên ảnh variant và variant button hiển thị thumbnail.
- ⚠️ Lỗi phát sinh khi verify và đã xử lý: chưa phát sinh lỗi TypeScript mới; Vite vẫn cảnh báo chunk lớn >500kB nhưng build pass.
- ✅ Verification bổ sung: `npm.cmd run build` pass ở `user-fe`, `git diff --check` không có whitespace error.

## ✅ Cập nhật Codex 2026-05-20 (fix migration flash sale)

- ✅ DB/migration: lỗi `public.FlashSaleItem does not exist` do DB local chưa apply các migration marketplace/flash sale; đã apply các migration còn thiếu vào database `DATN`.
- ✅ DB/migration: lỗi `P3006 unsafe use of new value "APPROVAL"` do migration thêm enum `APPROVAL` và dùng ngay trong cùng file; đã tách update dữ liệu `APROVAL -> APPROVAL` sang migration riêng `202605190002_fix_product_status_approval`.
- ✅ Prisma client: regenerate bằng `npx.cmd prisma@5.17.0 generate` để khớp `prisma-client-py`.
- ✅ Verification bổ sung: `npx.cmd prisma migrate status` báo `Database schema is up to date`, `npx.cmd prisma validate` pass, Prisma Python query `flashsaleitem.count()` pass.

## ✅ Cập nhật Codex 2026-05-20 (seller variant stock/price)

- ✅ Backend product variant: `PATCH /products/variants/{variant_id}` cho seller sửa giá variant, validate giá > 0 và tự đồng bộ `Product.price` về giá variant thấp nhất.
- ✅ Backend inventory: tăng/giảm kho dùng endpoint ledger `/inventory/variants/{variant_id}/adjust`, ghi `InventoryLedger`, sync trạng thái product `ACTIVE/OUT_OF_STOCK` và invalidate product cache.
- ✅ user-fe seller inventory: thêm route/menu `/seller/inventory`, hiển thị từng variant thay vì từng product; seller nhập số lượng tăng thêm theo variant và sửa giá từng variant ngay trên bảng.
- ✅ user-fe seller dashboard: top products/inventory dashboard chuyển thao tác tăng kho sang inventory ledger và sửa giá theo `variantId`, không còn sửa giá product chung.
- ✅ user-fe seller dashboard data: dashboard flatten sản phẩm theo variant, thống kê tồn kho/giá theo variant để seller chọn đúng phân loại.
- ⚠️ Lỗi phát sinh khi verify và đã xử lý: chưa phát sinh lỗi compile/build mới; Vite vẫn cảnh báo chunk lớn >500kB nhưng build pass.
- ✅ Verification bổ sung: `python -m compileall BE\src` pass, `npm.cmd run build` pass ở `user-fe`, `git diff --check` không có whitespace error.

## ✅ Cập nhật Codex 2026-05-20 (wishlist, notification, ledger, marketing UI)

- ✅ user-fe Wishlist: thêm API/hooks `/wishlist`, route `/wishlist`, page danh sách yêu thích, nút tim trên `ProductCard`, link wishlist ở header và dropdown.
- ✅ Backend Wishlist: response trả product đầy đủ relations/active flash sale để wishlist page hiển thị đúng ảnh, shop, variant và giá sale.
- ✅ user-fe seller review reply: thêm route/menu `/seller/reviews`, gom review theo sản phẩm của shop và gọi `POST /reviews/{review_id}/reply`.
- ✅ user-fe shipment event timeline: order detail gọi `/shipments/order/{order_id}/events` và `ShipmentTracking` hiển thị timeline event thật, fallback về mốc shipment cũ nếu chưa có event.
- ✅ admin-FE inventory ledger: thêm route/sidebar `/inventory`, chọn shop và xem ledger từ `/inventory/shops/{shop_id}/ledger` với search, thống kê nhập/xuất và bảng variant.
- ✅ admin-FE notification thật: route `/notifications` không còn placeholder, đọc `/notifications`, mark read/read-all/delete và refresh realtime qua WS.
- ✅ Backend notification WS: chấp nhận mọi access token hợp lệ thay vì chỉ scope storefront, để admin token dùng được realtime notification.
- ✅ user-fe marketing/flash sale: `/promotions`/`/flash-sale` hiển thị banner từ `/marketing/banners`, track click banner và section sản phẩm có `activeFlashSale`.
- ✅ Review media: backend thêm `/uploads/media` cho image/video; review form user-fe hỗ trợ upload ảnh/video và gửi đúng `mediaUrls`.
- ✅ Mojibake demo: sửa lại tiếng Việt ở header, product card/grid/list, order detail, review form, shipment tracking, seller layout, admin sidebar và admin notifications.
- ⚠️ Lỗi phát sinh khi verify và đã xử lý: `user-fe` build fail do type hook shipment dùng `UseQueryOptions` bắt buộc `queryKey`; đã đổi signature sang `Omit<UseQueryOptions, "queryKey" | "queryFn">`.
- ⚠️ Ghi chú còn lại: Vite vẫn cảnh báo chunk JS >500kB ở cả user-fe/admin-FE, không làm build fail; chưa tách code-splitting trong lượt này.
- ✅ Verification bổ sung: `python -m compileall BE\src` pass, `npm.cmd run build` pass ở `user-fe`, `npm.cmd run build` pass ở `admin-FE`, `git diff --check` không có whitespace error.

## ✅ Cập nhật Codex 2026-05-20 (performance & scalability)

- ✅ Backend Redis: `delete_pattern` chuyển từ `KEYS` sang `SCAN` theo batch, tránh block Redis khi cache key tăng lớn.
- ✅ Backend cache: `RedisClient.set` serialize được Pydantic model qua `model_dump(mode="json")`, giúp cache các response typed ổn định hơn.
- ✅ Backend admin dashboard: thêm cache ngắn hạn 5 phút cho dashboard stats để giảm tải các truy vấn tổng hợp nhiều bảng khi admin reload liên tục.
- ✅ Backend product list: cache key ổn định theo `viewer_role` thay vì object user, thêm `order createdAt desc` để pagination có thứ tự deterministic.
- ✅ Backend seller reviews: thêm `GET /reviews/seller`, gom review của shop trong 1 request thay vì user-fe gọi N request theo từng product.
- ✅ user-fe catalog: debounce search 300ms trước khi gọi `/products`, giảm request khi người dùng gõ nhanh.
- ✅ user-fe product grid: wishlist query/mutation được gom ở grid/section, không còn mỗi `ProductCard` tự subscribe wishlist; giảm observer/render khi list lớn.
- ✅ user-fe render: product/recommendation image thêm `loading="lazy"` và `decoding="async"`, giảm tải initial render cho grid nhiều ảnh.
- ✅ user-fe seller reviews: đổi sang endpoint `/reviews/seller`, bỏ N+1 API request theo sản phẩm.
- ✅ Mojibake bổ sung: các component product card/grid/catalog/recommendation/recently-viewed dùng escaped text constants để tránh file bị lưu sai encoding.
- ⚠️ Ghi chú còn lại: bundle Vite vẫn lớn >500kB; bước scalability tiếp theo nên là lazy route/code splitting và tách vendor chunks.
- ✅ Verification bổ sung: `python -m compileall BE\src` pass, `npm.cmd run build` pass ở `user-fe`, `npm.cmd run build` pass ở `admin-FE`, `git diff --check` không có whitespace error.

## ✅ Cập nhật Codex 2026-05-20 (admin marketing form/module)

- ✅ admin-FE marketing: tách `/marketing` theo cấu trúc module `api/types/components/utils/view`, không còn gom API, type và UI trong `view/index.tsx`.
- ✅ admin-FE banner: tạo banner bằng dialog form có `title/subtitle/imageUrl/mobileImageUrl/redirectUrl/buttonText/position/status/priority/startAt/endAt`, validate required, priority và thời gian.
- ✅ admin-FE flash sale: tạo chương trình bằng dialog form có tên, thời gian, status; thêm item bằng form `productId/shopId/variantId/salePrice/stockLimit/purchaseLimit`, bỏ toàn bộ `window.prompt`.
- ✅ Checklist marketplace: cập nhật lại trạng thái Wishlist, review media, seller review reply, shipment timeline, banner/flash sale, payout, inventory ledger và notification theo phần đã triển khai.
- ⚠️ Lỗi phát sinh khi verify và đã xử lý: patch đầu tiên vào `marketing/view/index.tsx` không khớp do file cũ có mojibake/line mismatch; đã chia patch và replace view an toàn. `admin-FE` build vẫn cảnh báo chunk JS >500kB nhưng không fail.
- ✅ Verification bổ sung: `npm.cmd run build` pass ở `admin-FE`.
