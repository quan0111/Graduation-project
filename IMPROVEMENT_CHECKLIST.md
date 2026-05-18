# MarketHub — Danh sách cải thiện trước bảo vệ đồ án

> Tổng hợp từ quá trình review toàn bộ codebase: schema, backend API, user-fe, admin-fe, recommendation, chatbot.

---

## 🔴 Phải sửa trước bảo vệ

> Những lỗi này sẽ bị hội đồng phát hiện ngay khi demo.

- [x] **[1] Review button không bao giờ hiện — `user-fe`**
  - File: `src/modules/product/view/product-detail/index.tsx`
  - ✅ Đã sửa: `useAuthStore` được dùng để lấy `user`, truyền `userId={user?.id}` vào `<ProductReviews />`

- [x] **[2] Admin Analytics dùng mock data hardcode — `admin-FE`**
  - File: `src/modules/analytics/view/index.tsx`
  - ✅ Đã sửa: Kết nối thật với `/analytics/top-products`, `/finance/shop/{id}/revenue`, dashboard API, orders API. Dữ liệu revenue/category/top-shops đều tính từ API thật.

- [x] **[3] Console.log còn trong production code — `admin-FE`**
  - File: `src/modules/orders/view/index.tsx`
  - ✅ Đã sửa: Không còn `console.log` trong file này.

- [x] **[4] Commission hardcode 10%, không dùng config — `backend`**
  - File: `BE/src/modules/finance/finance_service.py`
  - ✅ Đã sửa: `_get_commission_rate()` query `ShopCommissionConfig` → fallback `CategoryCommissionConfig` → fallback 10%. Dùng chung qua `_calculate_item_commission()`.

- [x] **[5] Chatbot local knowledge base có mock product data — `user-fe`**
  - File: `src/modules/chatbot/components/chatbot-widget.tsx`
  - ✅ Đã sửa: Không còn key `"giới thiệu sản phẩm"` hay `"san pham noi bat"` hardcode iPhone/MacBook. Knowledge base chỉ còn FAQ chính sách, vận chuyển, thanh toán.

---

## 🟡 Nên sửa — Lỗi logic nghiệp vụ

- [x] **[6] Seller không có action đổi trạng thái đơn hàng — `user-fe`**
  - File: `src/modules/seller/view/order-detail/index.tsx`
  - ✅ Đã sửa: `sellerOrderTransitions` map đầy đủ (pending/paid → confirmed → processing → ready_to_ship → shipped → in_transit → delivered). Render nút động theo trạng thái hiện tại, gọi `useUpdateOrder`.

- [x] **[7] Review filter buttons tĩnh, không có logic — `user-fe`**
  - File: `src/modules/product/components/review.tsx`
  - ✅ Đã sửa: State `filter` với 4 option (all/5/4/comment), `filteredReviews` tính bằng `useMemo`, filter client-side.

- [x] **[8] Rating summary hiển thị 5 sao đầy bất kể rating thực — `user-fe`**
  - File: `src/modules/product/components/review.tsx`
  - ✅ Đã sửa: Component `RatingStars` render partial fill theo `value` thực tế (full/half/empty dùng clip-path percent).

- [x] **[9] Follow shop không gọi API — `user-fe`**
  - File: `src/modules/shop/view/index.tsx`
  - ✅ Đã sửa: Dùng `useFollowShop`, `useUnfollowShop`, `useIsFollowingShop`, `useShopFollowerCount` — tất cả gọi API thật, có error handling và toast.

- [x] **[10] Admin Categories — Edit/Delete chỉ có console.log — `admin-FE`**
  - File: `src/modules/categories/view/index.tsx`
  - ✅ Đã sửa: `handleEdit` mở Dialog với form pre-filled, `handleSaveEdit` gọi `useUpdateCategory`. `handleDelete` gọi `useDeleteCategory` với confirm dialog.

- [x] **[11] Admin Shops — Action buttons không có handler — `admin-FE`**
  - File: `src/modules/shop/view/index.tsx`
  - ✅ Đã sửa: Nút Eye mở Dialog chi tiết shop. Nút MoreVertical gọi `handleToggleActive` → `useUpdateShop` để ban/unban. Dialog có nút ban/unban inline.

- [x] **[12] Admin Products — Category filter hardcode — `admin-FE`**
  - File: `src/modules/products/view/index.tsx`
  - ✅ Đã sửa: Dùng `useGetCategories()` để lấy danh sách category từ API, render `<option>` động.

- [x] **[13] Coupon race condition — `backend`**
  - File: `BE/src/modules/coupon/coupon_service.py` — hàm `use_coupon()`
  - ✅ Đã sửa: `data={"usedCount": {"increment": 1}}` — atomic increment.

- [x] **[14] Review hard delete thay vì soft delete — `backend`**
  - File: `BE/src/modules/review/review_service.py` — hàm `delete_review()`
  - ✅ Đã sửa: `prisma.review.update(data={"deletedAt": datetime.utcnow()})` — soft delete nhất quán.

- [x] **[15] Tax tính ở FE nhưng không có trong schema — `user-fe` + `backend`**
  - File: `src/modules/order/hook/useCheckout.ts`
  - ✅ Đã sửa: `tax = 0` (không cộng vào total), comment rõ "Tax is not persisted in the current Order schema". `totalAmount` = subtotal + shippingFee - discount, không có tax.

- [x] **[16] Recommendation reason không nhất quán — `backend`**
  - File: `BE/src/modules/analytics/analytics_service.py`
  - ✅ Đã sửa: `_attach_reasons()` import `build_product_reason` từ `src.utils.recommendation_reason` — dùng chung utility với chatbot service.

- [x] **[17] `recommendationReason` thiếu trong TypeScript type — `user-fe`**
  - File: `src/modules/product/types/index.ts`
  - ✅ Đã sửa: `recommendationReason?: string` đã có trong interface `IProduct`.

- [x] **[18] Retry payment có thể conflict unique constraint — `backend`**
  - File: `BE/src/modules/order/payment_service.py` — `create_gateway_payment()`
  - Lỗi: Khi retry, `providerOrderId` được tạo từ `orderId` (MoMo/VNPay đều dùng orderId làm base). Nếu payment record cũ vẫn còn `providerOrderId` cũ và retry tạo cùng giá trị → conflict `@unique`.
  - **Hiện trạng**: Code đã dùng `prisma.payment.update` khi `existing` tồn tại (thay vì create mới), nhưng `providerOrderId` vẫn có thể trùng nếu gateway từ chối và tạo lại với cùng orderId.
  - Sửa: Thêm timestamp/random suffix vào `providerOrderId` khi retry để đảm bảo unique.

---

## 🟢 Cải thiện UX / Code quality

- [x] **[19] `window.location.reload()` thay vì invalidate query — `user-fe`**
  - ✅ Đã sửa: `order-detail` dùng `queryClient.invalidateQueries`. `CancelOrderModal` và `ReturnRequestForm` đều nhận `onSuccess` callback để invalidate query từ parent.

- [x] **[20] Checkout state mất khi refresh trang — `user-fe`**
  - File: `src/modules/order/view/checkout/index.tsx`
  - ✅ Đã sửa: Persist vào `sessionStorage` với key `markethub.checkout.items`. Khi load, đọc từ `sessionStorage` nếu `location.state` không có. Xóa sau khi đặt hàng thành công.

- [x] **[21] Conversation history stateless trong chatbot — `user-fe`**
  - File: `src/modules/chatbot/components/chatbot-widget.tsx`
  - ✅ Đã sửa: Gửi kèm `history: ChatbotHistoryMessage[]` (8 tin gần nhất, bỏ welcome message) lên backend.

- [x] **[22] `secure=False` trong cookie — `backend`**
  - File: `BE/src/modules/auth/service.py`
  - ✅ Đã sửa: `secure_cookie = settings.COOKIE_SECURE if settings.COOKIE_SECURE is not None else not settings.DEBUG` — toggle qua env variable.

- [x] **[23] Không có flow seller submit sản phẩm để duyệt — `backend` + `user-fe`**
  - ✅ Đã sửa: Trang `new-product` submit sản phẩm với trạng thái `DRAFT` lên admin. Toast message "San pham da gui len admin o trang thai draft". Admin có thể approve/reject từ products page.

- [x] **[24] Seller không có trang edit sản phẩm — `user-fe`**
  - ✅ Đã sửa: `SellerProductsPage` có nút Edit mở `ProductFormModal` với data pre-filled. Không cần route riêng — dùng modal inline.

---

## 🔴 Lỗi logic mới phát hiện (chưa sửa)

- [x] **[25-A] Nút "Quay lại" trong IdentityForm và TaxForm bị hỏng — `user-fe`**
  - File: `src/modules/seller/component/identify-form.tsx`, `tax-form.tsx`
  - Lỗi: `<Button variant="outline" disabled={isLoading}>Quay lại</Button>` — không có `onClick` handler. Click không làm gì.
  - Sửa: Thêm prop `onPrev?: () => void` vào cả hai component, truyền `handlePrevStep` từ parent `index.tsx`.

- [x] **[25-B] Identity data (CCCD) thu thập nhưng không gửi lên server — `user-fe`**
  - File: `src/modules/seller/view/create/index.tsx` — `handleComplete()`
  - Lỗi: `payload` chỉ gửi `shopName, businessPhone, businessEmail, addressLine, ward, district, province, taxCode`. Toàn bộ `identityInfo` (fullName, cccdNumber, cccdFrontImage, cccdBackImage) bị bỏ qua hoàn toàn.
  - Hậu quả: Bước "Định danh" là UI theater — user điền nhưng dữ liệu không đi đến đâu.
  - Sửa: Hoặc upload ảnh CCCD lên Cloudinary và thêm field vào `SellerApplicationCreate` schema, hoặc bỏ bước này nếu không cần thiết cho MVP.

- [x] **[25-C] Shipping toggles và Tax form ghi đè nhau — `user-fe`**
  - File: `src/modules/seller/view/create/index.tsx`
  - Lỗi: `handleShippingNext` lưu vào `registration.taxInfo`. `handleTaxSubmit` cũng lưu vào `registration.taxInfo`. Step nào chạy sau sẽ overwrite step trước — delivery toggles từ step 2 bị mất khi hoàn thành step 4.
  - Sửa: Tách `shippingInfo` thành state riêng trong `SellerRegistration`, không dùng chung `taxInfo`.

- [x] **[25-D] Redirect sau submit có thể gây loop — `user-fe`**
  - File: `src/modules/seller/view/create/index.tsx` — `handleComplete()`
  - Lỗi: `navigate("/seller", { replace: true })` sau khi submit thành công. User vẫn là `BUYER` (chưa được admin approve). Nếu route `/seller` yêu cầu role `SELLER` → redirect ngược lại trang đăng ký → loop vô hạn.
  - Sửa: Navigate về `/` hoặc hiển thị màn hình "Đang chờ duyệt" thay vì redirect sang `/seller`.

- [x] **[25-E] Không có UI cho trạng thái REJECTED / NEED_MORE_INFO — `user-fe`**
  - File: `src/modules/seller/view/create/index.tsx`
  - Lỗi: Code chỉ xử lý `PENDING` và `APPROVED`. Nếu application bị `REJECTED`, user thấy form đăng ký lại mà không có thông báo lý do.
  - Sửa: Thêm case `REJECTED` và `NEED_MORE_INFO` — hiển thị lý do từ `application.note` và cho phép nộp lại.

- [x] **[25-F] `get_my_application` dùng `find_first` không có ordering — `backend`**
  - File: `BE/src/modules/seller/seller_service.py`
  - Lỗi: `find_first(where={"userId": user_id})` không có `order_by` → kết quả không xác định nếu user có nhiều application (ví dụ bị reject rồi nộp lại).
  - Sửa: Thêm `order={"createdAt": "desc"}` để luôn lấy application mới nhất.

---

## � Tính năng còn thiếu (so với chuẩn multi-vendor VN)

| # | Tính năng | Mức độ | Ghi chú |
|---|-----------|--------|---------|
| 26 | Wishlist / Saved items | 🔴 Cơ bản | Đã thêm model `Wishlist` và API `/wishlist` |
| 27 | Chat buyer ↔ seller | 🔴 Quan trọng | Module `chat` có ở BE nhưng không có ở user-FE |
| 28 | Review có ảnh/video | 🟡 Nên có | Đã thêm `ReviewMedia` và `mediaUrls` khi tạo review |
| 29 | Seller reply review | 🟡 Nên có | Đã thêm model/API `ReviewReply` cho seller phản hồi |
| 30 | `usageLimitPerUser` cho coupon | 🟡 Nên có | Đã thêm `usageLimitPerUser` và `CouponRedemption` |
| 31 | Flash sale / time-limited deals | 🟡 Nên có | Đã thêm model `FlashSale` / `FlashSaleItem` |
| 32 | ShipmentEvent (log từng mốc vận chuyển) | 🟡 Nên có | Đã thêm `ShipmentEvent` và API xem event theo order |
| 33 | Pagination cho list endpoints | 🟡 Cần verify | Chưa thấy cursor/offset pagination trên các list lớn |
| 34 | Export Excel/CSV cho admin | 🟢 Nice-to-have | Orders, revenue, users |

---

## 🎯 Câu hỏi hội đồng có thể hỏi — Chuẩn bị sẵn câu trả lời

| Câu hỏi | Câu trả lời |
|---------|-------------|
| Scalability khi có nhiều user? | Redis cache trên product service (`@cache_result`), nhưng chưa có cache cho order/cart. Bottleneck chính là DB query. Hướng mở rộng: thêm Redis cho session, read replica cho PostgreSQL |
| Search hoạt động thế nào? | Hiện dùng `ILIKE '%keyword%'` — không scale với catalog lớn. Hướng cải thiện: PostgreSQL `tsvector` full-text search hoặc Elasticsearch |
| Recommendation algorithm? | Hybrid 4 tầng: Item-CF (cosine similarity tự implement) + behavior profile (category/shop/tag/price affinity) + co-purchase scoring + popularity fallback. Retrain định kỳ qua APScheduler |
| Chatbot hoạt động thế nào? | Intent routing 13 loại, RAG pattern (inject context DB thật vào prompt Ollama), graceful degradation khi Ollama offline, hybrid local KB + backend, gửi kèm conversation history |
| Bảo mật? | JWT + refresh token rotation (hash SHA-256), rate limiting, IP blacklist, auto-lock sau 8 lần failed login/15 phút, behavior anomaly detection (120 events/10 phút) |
| Commission tính thế nào? | Query `ShopCommissionConfig` theo shopId → fallback `CategoryCommissionConfig` → fallback 10%. Tính per-item với rate cache để tránh N+1 query |
| Xử lý race condition khi nhiều người mua cùng lúc? | Stock deduct dùng `update_many` với điều kiện `stock >= quantity` — atomic, tránh oversell |
| Seller đăng ký như thế nào? | 5-bước wizard: thông tin shop → vận chuyển → định danh → thuế → xác nhận. Submit tạo `SellerApplication` với status PENDING, admin duyệt qua admin-FE |

---

## 📊 Đánh giá tổng thể

```
Nghiệp vụ e-commerce:      █████████░  9/10
Data model & schema:        █████████░  9/10
Backend architecture:       ████████░░  8/10
Frontend logic (user-fe):   ████████░░  8/10
Frontend logic (admin-fe):  ████████░░  8/10
Seller portal:              ███████░░░  7/10
AI Recommendation:          ████████░░  8/10
Chatbot:                    █████████░  9/10
Hiệu năng & scalability:    █████░░░░░  5/10
```

**Điểm mạnh nổi bật:**
- State machine đầy đủ cho order transitions theo role (seller có action buttons)
- Atomic stock deduct tránh oversell
- Redis caching trên product service
- Payment audit trail (PaymentEvent log)
- Security auto-lock với behavior anomaly detection
- Return workflow hoàn chỉnh 7 trạng thái với stock restore
- Hybrid recommendation (Item-CF + behavior + co-purchase) với shared reason utility
- RAG chatbot với graceful degradation + conversation history
- Commission tính động theo ShopCommissionConfig/CategoryCommissionConfig
- Analytics admin kết nối API thật

**Điểm yếu còn lại:**
- Seller registration: CCCD data không được gửi lên server (UI theater)
- Seller registration: nút Quay lại bị hỏng ở bước Identity và Tax
- Seller registration: không có UI cho REJECTED/NEED_MORE_INFO status
- Retry payment có thể conflict unique constraint trên `providerOrderId`
- `get_my_application` không có ordering → non-deterministic
- Không có Redis cache cho order/cart
- Search dùng ILIKE không scale

