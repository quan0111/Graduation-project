# Hướng Dẫn Trình Bày Đồ Án

Tên đề tài: **Trang thương mại điện tử có hỗ trợ đề xuất sản phẩm bằng AI**

Mục tiêu khi bảo vệ: trình bày rõ đây không chỉ là website CRUD, mà là một hệ thống e-commerce có luồng nghiệp vụ mua bán tương đối đầy đủ, đồng thời có module AI recommendation dựa trên hành vi người dùng.

---

## 1. Câu Giới Thiệu Ngắn

Bạn có thể mở đầu như sau:

> Đề tài của em là xây dựng website thương mại điện tử có hỗ trợ đề xuất sản phẩm bằng AI. Hệ thống gồm ba nhóm người dùng chính: khách hàng, người bán và quản trị viên. Ngoài các chức năng e-commerce như sản phẩm, giỏ hàng, đơn hàng, thanh toán, vận chuyển, khuyến mãi và hoàn trả, hệ thống còn ghi nhận hành vi người dùng như xem, click, thêm giỏ, mua hàng để đề xuất sản phẩm phù hợp hơn.

Nếu muốn nói ngắn hơn:

> Điểm trọng tâm của đề tài là kết hợp nghiệp vụ thương mại điện tử với hệ thống đề xuất sản phẩm cá nhân hóa dựa trên dữ liệu hành vi người dùng.

---

## 2. Bố Cục Trình Bày Nên Đi Theo

### 2.1. Lý do chọn đề tài

Bạn có thể nói:

- Thương mại điện tử là lĩnh vực quen thuộc nhưng có nhiều nghiệp vụ thực tế: đơn hàng, thanh toán, tồn kho, vận chuyển, đổi trả.
- Người dùng thường bị quá tải khi có nhiều sản phẩm, nên hệ thống đề xuất giúp họ tìm sản phẩm phù hợp nhanh hơn.
- Vì vậy đề tài tập trung vào cả phần vận hành e-commerce và phần AI recommendation.

### 2.2. Mục tiêu hệ thống

Nói các mục tiêu chính:

- Xây dựng website mua bán trực tuyến có nhiều vai trò.
- Cho phép seller đăng bán và xử lý đơn hàng.
- Cho phép admin quản trị sản phẩm, seller, banner, coupon, flash sale, doanh thu.
- Ghi nhận hành vi người dùng để phục vụ đề xuất sản phẩm.
- Đưa ra gợi ý sản phẩm ở trang chủ, trang chi tiết sản phẩm và chatbot.

### 2.3. Vai trò người dùng

**Khách hàng:**

- Xem sản phẩm, tìm kiếm, lọc sản phẩm.
- Thêm vào giỏ hàng, thanh toán.
- Theo dõi đơn hàng, hủy đơn khi còn hợp lệ.
- Xác nhận đã nhận hàng, đánh giá sản phẩm.
- Tạo yêu cầu trả hàng/hoàn tiền nếu có vấn đề.

**Người bán:**

- Quản lý sản phẩm, biến thể, tồn kho.
- Xử lý đơn hàng.
- Nhập thông tin vận chuyển.
- Theo dõi doanh thu và thống kê.

**Admin:**

- Quản lý user/seller/shop.
- Duyệt hoặc khóa sản phẩm.
- Quản lý banner, coupon, flash sale.
- Theo dõi dashboard, doanh thu, thống kê.
- Xử lý ngoại lệ như vi phạm, hoàn tiền, khiếu nại.

---

## 3. Phần Cần Nhấn Mạnh: AI Đề Xuất Sản Phẩm

Đây là phần đúng với tên đề tài, nên phải nói rõ.

### 3.1. Hệ thống lấy dữ liệu AI từ đâu?

Trả lời:

> Hệ thống ghi nhận hành vi người dùng trong quá trình sử dụng website. Các hành vi chính gồm VIEW, CLICK, ADD_TO_CART và PURCHASE. Mỗi hành vi có trọng số khác nhau, ví dụ mua hàng có ý nghĩa mạnh hơn click, click mạnh hơn view.

Có thể giải thích thêm:

- VIEW: người dùng xem sản phẩm.
- CLICK: người dùng click vào sản phẩm hoặc gợi ý.
- ADD_TO_CART: người dùng thêm sản phẩm vào giỏ.
- PURCHASE: người dùng mua sản phẩm.
- Dữ liệu đơn hàng cũng được dùng để tăng trọng số cho sản phẩm đã mua.

### 3.2. Tại sao cần trọng số hành vi?

Câu trả lời mẫu:

> Không phải hành vi nào cũng thể hiện mức độ quan tâm giống nhau. Việc xem sản phẩm chỉ là tín hiệu nhẹ, click thể hiện quan tâm hơn, thêm vào giỏ cho thấy ý định mua rõ hơn, còn mua hàng là tín hiệu mạnh nhất. Vì vậy hệ thống gán trọng số tăng dần để mô hình hiểu sở thích người dùng chính xác hơn.

### 3.3. Hệ thống dùng thuật toán gì?

Trả lời ngắn:

> Hệ thống dùng hướng hybrid recommendation, kết hợp nhiều tín hiệu: collaborative filtering, hồ sơ hành vi người dùng, sản phẩm đang xem, session gần đây, độ phổ biến, semantic retrieval/pgvector và các mô hình ranking như LTR, Two-Tower, NCF nếu đã train.

Giải thích dễ hiểu:

- **Item-based collaborative filtering:** gợi ý dựa trên sản phẩm mà những người dùng tương tự đã tương tác.
- **Behavior profile:** xây hồ sơ sở thích theo danh mục, shop, tag, sản phẩm người dùng đã xem/mua.
- **Context product:** nếu user đang xem một sản phẩm, hệ thống gợi ý sản phẩm cùng danh mục, cùng shop, cùng tag hoặc liên quan.
- **Session profile:** nếu user chưa đăng nhập hoặc mới xem vài sản phẩm gần đây, hệ thống vẫn dùng session gần đây để gợi ý.
- **Semantic retrieval/pgvector:** tìm sản phẩm liên quan theo nội dung sản phẩm, tên, mô tả, tag, danh mục.
- **Learning to Rank, Two-Tower, NCF:** dùng khi có dữ liệu train để xếp hạng kết quả tốt hơn.
- **Popular fallback:** nếu thiếu dữ liệu thì fallback sang sản phẩm phổ biến.

### 3.4. Vì sao chọn hybrid recommendation?

Trả lời:

> Vì dữ liệu trong đồ án không lớn như hệ thống thật. Nếu chỉ dùng một mô hình học máy thì dễ bị thiếu dữ liệu, đặc biệt với user mới hoặc sản phẩm mới. Hybrid recommendation giúp kết hợp nhiều nguồn tín hiệu, có fallback khi thiếu dữ liệu và vẫn hoạt động được trong trường hợp cold-start.

### 3.5. Cold-start xử lý thế nào?

Nếu hội đồng hỏi user mới/sản phẩm mới thì trả lời:

> Với user mới, hệ thống chưa có lịch sử cá nhân nên dùng sản phẩm phổ biến, sản phẩm theo session gần đây, từ khóa tìm kiếm và semantic retrieval. Với sản phẩm mới, hệ thống có thể dựa vào thông tin nội dung như tên, danh mục, shop, tag, mô tả và embedding để đưa vào danh sách gợi ý.

### 3.6. AI có train không?

Trả lời:

> Có. Backend có chức năng huấn luyện lại mô hình recommendation từ dữ liệu hành vi và đơn hàng. Khi train, hệ thống build interaction từ UserBehavior và OrderItem, sau đó lưu model để phục vụ đề xuất. Admin cũng có nút huấn luyện lại và đồng bộ embedding sản phẩm ở trang analytics.

Nói rõ thêm nếu bị hỏi:

- Dữ liệu train lấy trong khoảng thời gian gần đây.
- Có lock khi train để tránh nhiều job train chạy chồng nhau.
- Có endpoint admin để retrain.
- Có đồng bộ embedding sản phẩm vào pgvector.

### 3.7. AI đánh giá chất lượng bằng gì?

Trả lời:

> Hệ thống có các chỉ số đánh giá như HitRate@10, NDCG@10, CTR và Conversion Rate. HitRate/NDCG dùng để đánh giá offline xem sản phẩm liên quan có nằm trong top gợi ý hay không. CTR và Conversion dùng để theo dõi hành vi thực tế: người dùng có click và mua sau khi được gợi ý hay không.

Giải thích ngắn:

- **HitRate@10:** trong top 10 gợi ý có trúng sản phẩm liên quan không.
- **NDCG@10:** sản phẩm liên quan có được xếp ở vị trí cao không.
- **CTR:** tỷ lệ click trên lượt xem.
- **Conversion:** tỷ lệ mua hàng sau click.

### 3.8. AI gợi ý ở những đâu?

Trả lời:

- Trang chủ: gợi ý sản phẩm phù hợp hoặc phổ biến.
- Trang chi tiết sản phẩm: gợi ý sản phẩm tương tự/liên quan.
- Chatbot: khi người dùng hỏi “tìm sản phẩm dưới 500k”, “gợi ý sản phẩm tương tự”, chatbot gọi recommendation để trả sản phẩm.
- Analytics/admin: theo dõi hành vi và chất lượng recommendation.

### 3.9. Nếu hỏi “Chatbot có phải AI chính không?”

Trả lời:

> Chatbot là phần hỗ trợ trải nghiệm người dùng, còn trọng tâm AI của đề tài là hệ thống đề xuất sản phẩm. Chatbot có thể dùng dữ liệu sản phẩm và recommendation để trả lời, nhưng phần chính vẫn là ghi nhận hành vi và sinh gợi ý sản phẩm cá nhân hóa.

---

## 4. Luồng Demo Nên Trình Bày

Nếu demo 7-10 phút, nên đi theo flow này:

### Flow 1: User mua hàng

1. Mở trang chủ.
2. Xem danh sách sản phẩm và khu vực gợi ý.
3. Click vào một sản phẩm.
4. Chọn biến thể còn hàng.
5. Thêm vào giỏ.
6. Checkout.
7. Chọn COD hoặc MoMo/VNPay.
8. Tạo đơn.

Điểm cần nói:

> Khi user xem/click/thêm giỏ/mua hàng, hệ thống ghi nhận hành vi để phục vụ recommendation.

### Flow 2: Seller xử lý đơn

1. Seller đăng nhập.
2. Vào danh sách đơn hàng.
3. Xác nhận đơn.
4. Nhập đơn vị vận chuyển và mã vận đơn.
5. Chuyển trạng thái đã gửi hàng.

Điểm cần nói:

> Seller là người xử lý giao hàng, admin không tự kéo đơn sang shipped/delivered trong luồng bình thường.

### Flow 3: User nhận hàng và đánh giá

1. User vào chi tiết đơn.
2. Xem timeline/trạng thái.
3. Xác nhận đã nhận hàng.
4. Đánh giá sản phẩm.

Điểm cần nói:

> Hệ thống chỉ cho đánh giá sau khi đơn đã giao/hoàn tất để tránh review ảo.

### Flow 4: AI recommendation

1. Sau khi user tương tác vài sản phẩm, quay lại trang chủ hoặc trang chi tiết.
2. Cho thấy danh sách sản phẩm gợi ý.
3. Mở chatbot hỏi: “gợi ý sản phẩm dưới 500k” hoặc “sản phẩm tương tự”.
4. Mở admin analytics để xem HitRate/NDCG/CTR/Conversion hoặc nút train/sync embedding.

Điểm cần nói:

> Recommendation không phải hard-code. Nó lấy dữ liệu hành vi, dữ liệu sản phẩm và mô hình ranking để sinh danh sách.

---

## 5. Các Điểm Nghiệp Vụ E-commerce Nên Nói

### 5.1. Đơn hàng có state machine

Trả lời nếu hỏi:

> Đơn hàng không được chuyển trạng thái tùy ý. Mỗi vai trò chỉ được thao tác trong phạm vi nghiệp vụ. User có thể hủy/yêu cầu trả hàng theo trạng thái hợp lệ. Seller xử lý xác nhận, đóng gói, vận chuyển. Admin chủ yếu can thiệp ngoại lệ.

Ví dụ:

- User không tự chuyển đơn sang `DELIVERED`.
- Admin không tự kéo đơn sang `SHIPPED` trong luồng bình thường.
- Seller phải nhập thông tin vận chuyển trước khi gửi hàng.
- Đơn đã gửi/giao thì không sửa mã vận đơn tùy tiện.

### 5.2. Tồn kho

Trả lời:

> Tồn kho được quản lý theo ProductVariant. Khi mua hàng, hệ thống kiểm tra biến thể còn hàng. Biến thể hết hàng không cho chọn ở trang chi tiết và backend vẫn kiểm tra lại khi checkout để tránh oversell.

Nếu hỏi sản phẩm không biến thể:

> Hướng xử lý là mỗi sản phẩm cần có ít nhất một variant mặc định. Như vậy checkout luôn xử lý qua variantId, logic tồn kho thống nhất hơn.

### 5.3. Flash sale

Trả lời:

> Flash sale không chỉ giảm giá sản phẩm mà còn có quota riêng. Khi checkout phải kiểm tra thời gian flash sale, tồn kho sản phẩm và số lượng flash sale còn lại. Nếu hết hạn hoặc hết quota thì không được mua theo giá flash sale.

### 5.4. Coupon/voucher

Trả lời:

> Voucher được kiểm tra ở bước checkout theo điều kiện như thời gian hiệu lực, giá trị đơn tối thiểu, shop/sản phẩm áp dụng và giới hạn số lượt dùng. Backend là nơi quyết định cuối cùng để tránh user sửa giá phía frontend.

### 5.5. COD và thanh toán online khác nhau thế nào?

Trả lời:

> Với COD, đơn có thể được tạo ngay sau khi user xác nhận checkout vì tiền thu khi nhận hàng. Với MoMo/VNPay, hệ thống chỉ xác nhận thanh toán khi cổng thanh toán trả callback/IPN thành công. Điều này tránh trường hợp user mở trang thanh toán nhưng chưa trả tiền mà hệ thống vẫn coi là đã thanh toán.

### 5.6. IPN là gì?

Trả lời:

> IPN là callback server-to-server từ cổng thanh toán về backend. Nó quan trọng hơn redirect frontend vì user có thể đóng tab hoặc mất mạng. Backend dùng IPN để xác nhận trạng thái thanh toán một cách đáng tin cậy.

### 5.7. Trả hàng/hoàn tiền

Trả lời:

> User tạo yêu cầu trả hàng từ chi tiết đơn, nhập lý do và bằng chứng. Seller/admin xem xét. Nếu đơn đã thanh toán online thì cần xử lý refund trước khi đóng luồng hoàn. Timeline và log giúp theo dõi ai xử lý và xử lý lúc nào.

---

## 6. Câu Hỏi Hội Đồng Có Thể Hỏi Và Cách Trả Lời

### Câu 1: Điểm mới của đề tài là gì?

Trả lời:

> Ngoài các chức năng thương mại điện tử cơ bản, hệ thống có module đề xuất sản phẩm dựa trên hành vi người dùng. Hệ thống ghi nhận view, click, add-to-cart, purchase, sau đó kết hợp collaborative filtering, profile hành vi, semantic retrieval và ranking để đề xuất sản phẩm phù hợp.

### Câu 2: AI của em có phải chỉ là lọc sản phẩm không?

Trả lời:

> Không chỉ là lọc. Lọc sản phẩm dựa trên điều kiện trực tiếp như giá hoặc danh mục. Còn recommendation dùng dữ liệu hành vi và tương quan giữa người dùng/sản phẩm để xếp hạng sản phẩm. Ngoài ra hệ thống còn dùng nội dung sản phẩm và embedding để xử lý trường hợp thiếu lịch sử.

### Câu 3: Nếu user chưa đăng nhập thì gợi ý kiểu gì?

Trả lời:

> Nếu chưa đăng nhập, hệ thống không có lịch sử userId nên ưu tiên session gần đây, từ khóa tìm kiếm, sản phẩm đang xem, semantic retrieval và sản phẩm phổ biến. Khi user đăng nhập, hệ thống dùng thêm lịch sử cá nhân để gợi ý chính xác hơn.

### Câu 4: Nếu sản phẩm mới chưa ai mua thì có được gợi ý không?

Trả lời:

> Có thể. Với sản phẩm mới, hệ thống dùng thông tin nội dung như tên, mô tả, danh mục, shop, tag và embedding để tìm sản phẩm liên quan. Tuy nhiên khi chưa có tương tác, điểm từ collaborative filtering sẽ thấp hơn sản phẩm đã có lịch sử.

### Câu 5: Vì sao không dùng một mô hình deep learning duy nhất?

Trả lời:

> Với dữ liệu đồ án, số lượng user và interaction chưa lớn như hệ thống thật. Nếu chỉ dùng deep learning thì dễ overfit hoặc thiếu dữ liệu. Vì vậy em chọn hướng hybrid: có model học từ hành vi, có semantic retrieval, có popularity fallback và có ranking tổng hợp. Cách này thực tế hơn với dữ liệu vừa và nhỏ.

### Câu 6: Làm sao biết gợi ý có tốt không?

Trả lời:

> Em dùng các metric như HitRate@10, NDCG@10 để đánh giá offline và CTR, Conversion để theo dõi hành vi thực tế. Nếu HitRate/NDCG cao hơn, nghĩa là sản phẩm liên quan xuất hiện tốt hơn trong top gợi ý. Nếu CTR/Conversion tăng, nghĩa là người dùng phản hồi tốt hơn với đề xuất.

### Câu 7: Hệ thống có bảo mật không?

Trả lời:

> Hệ thống phân quyền theo vai trò user, seller và admin. Các API quan trọng như quản trị, train model, quản lý seller/sản phẩm chỉ cho admin. Các thao tác đơn hàng cũng kiểm tra quyền sở hữu hoặc vai trò trước khi cho cập nhật.

### Câu 8: Vì sao admin không được tự chuyển đơn sang đã giao?

Trả lời:

> Vì đúng nghiệp vụ e-commerce, seller hoặc đơn vị vận chuyển mới là bên xử lý giao hàng. Admin chỉ nên can thiệp ngoại lệ. Nếu admin có thể tự chuyển mọi trạng thái thì timeline đơn hàng dễ sai và không phản ánh đúng trách nhiệm từng vai trò.

### Câu 9: Vì sao cần timeline đơn hàng?

Trả lời:

> Timeline giúp theo dõi lịch sử xử lý đơn: tạo đơn, thanh toán, xác nhận, gửi hàng, giao hàng, nhận hàng, hủy, trả hàng hoặc hoàn tiền. Nó giúp user, seller và admin hiểu đơn đã đi qua bước nào và ai đã xử lý.

### Câu 10: Thanh toán online có gì khó?

Trả lời:

> Khó ở chỗ không được tin frontend hoàn toàn. User có thể đóng tab sau khi quét mã hoặc redirect thất bại. Vì vậy backend cần IPN/callback từ cổng thanh toán để xác nhận. Ngoài ra phải xử lý idempotency để callback nhiều lần không làm sai trạng thái hoặc trừ/cộng kho nhiều lần.

### Câu 11: Tại sao phải kiểm tra tồn kho ở backend nếu frontend đã disable variant hết hàng?

Trả lời:

> Frontend chỉ giúp trải nghiệm người dùng, không phải lớp bảo mật. User có thể sửa request hoặc tồn kho có thể thay đổi giữa lúc xem sản phẩm và checkout. Vì vậy backend vẫn phải kiểm tra tồn kho lần cuối trước khi tạo đơn.

### Câu 12: Nếu hai người cùng mua sản phẩm cuối cùng thì sao?

Trả lời:

> Backend phải xử lý trừ kho theo transaction hoặc logic kiểm tra cập nhật nguyên tử để tránh oversell. Frontend chỉ hiển thị trạng thái, còn quyết định cuối cùng nằm ở backend.

### Câu 13: Vì sao sản phẩm có variant?

Trả lời:

> Vì trong e-commerce, một sản phẩm có thể có nhiều phân loại như size, màu, dung lượng. Mỗi variant có tồn kho riêng. Checkout theo variant giúp quản lý tồn kho chính xác hơn.

### Câu 14: Nếu đơn thanh toán online thất bại thì sao?

Trả lời:

> Đơn hoặc payment hold sẽ ở trạng thái chờ/thất bại/hết hạn. Hệ thống không tính các đơn này vào doanh thu. Nếu có giữ tồn kho tạm thời thì khi hết hạn phải release lại tồn kho, coupon và quota flash sale.

### Câu 15: Doanh thu tính như thế nào?

Trả lời:

> Doanh thu chỉ nên tính các đơn đã giao/hoàn tất, không tính đơn hủy, đơn thất bại thanh toán hoặc pending payment. Điều này giúp dashboard phản ánh doanh thu thực tế hơn.

### Câu 16: Chatbot có trả lời bịa không?

Trả lời:

> Chatbot được giới hạn trả lời trong phạm vi MarketHub và ưu tiên dữ liệu hệ thống như sản phẩm, đơn hàng, chính sách, tồn kho, flash sale. Nếu thiếu dữ liệu thì bot nên nói chưa đủ dữ liệu thay vì bịa.

### Câu 17: Hạn chế của hệ thống là gì?

Trả lời nên trung thực:

> Hạn chế lớn nhất là dữ liệu demo chưa nhiều nên chất lượng recommendation chưa thể tốt như hệ thống production. Payment gateway cũng cần test sandbox/public URL kỹ nếu demo thanh toán thật. Ngoài ra nếu triển khai thật cần tăng cường logging, monitoring, background job và kiểm thử tải.

### Câu 18: Hướng phát triển tiếp theo?

Trả lời:

> Em muốn phát triển thêm realtime notification, A/B testing cho recommendation, job tự động expire payment pending, refund tự động qua cổng thanh toán, tối ưu search, và dashboard AI chi tiết hơn theo từng chiến dịch hoặc nhóm người dùng.

---

## 7. Những Câu Không Nên Nói Quá

Tránh nói:

- “AI đề xuất chính xác tuyệt đối.”
- “Hệ thống tự học realtime hoàn toàn.”
- “Thanh toán đã chạy production.”
- “Mô hình deep learning là phần chính duy nhất.”

Nên nói:

- “Hệ thống dùng hướng hybrid recommendation.”
- “Chất lượng đề xuất phụ thuộc dữ liệu hành vi.”
- “Có cơ chế fallback khi thiếu dữ liệu.”
- “Backend là nơi kiểm tra cuối cùng cho tồn kho, giá, voucher và thanh toán.”

---

## 8. Script Trình Bày Ngắn 5 Phút

Bạn có thể học đoạn này:

> Đề tài của em là website thương mại điện tử có hỗ trợ đề xuất sản phẩm bằng AI. Hệ thống có ba vai trò: khách hàng, người bán và admin. Khách hàng có thể xem sản phẩm, thêm giỏ, thanh toán, theo dõi đơn, nhận hàng, đánh giá và trả hàng. Người bán quản lý sản phẩm, xử lý đơn và nhập thông tin vận chuyển. Admin quản lý seller, sản phẩm, banner, coupon, flash sale và thống kê doanh thu.
>
> Điểm chính của đề tài là module đề xuất sản phẩm. Trong quá trình người dùng sử dụng hệ thống, backend ghi nhận các hành vi như xem, click, thêm giỏ và mua hàng. Các hành vi này được gán trọng số khác nhau vì mức độ thể hiện nhu cầu khác nhau. Từ dữ liệu đó, hệ thống xây dựng recommendation theo hướng hybrid, kết hợp collaborative filtering, hồ sơ hành vi người dùng, sản phẩm đang xem, session gần đây, semantic retrieval/pgvector, learning-to-rank và fallback theo độ phổ biến.
>
> Nhờ vậy, hệ thống có thể gợi ý sản phẩm ở trang chủ, trang chi tiết sản phẩm và chatbot. Với user mới hoặc sản phẩm mới, hệ thống vẫn có thể dùng nội dung sản phẩm, từ khóa, session và sản phẩm phổ biến để xử lý cold-start. Chất lượng đề xuất được theo dõi bằng các chỉ số như HitRate@10, NDCG@10, CTR và Conversion.
>
> Ngoài AI, em cũng xử lý các nghiệp vụ e-commerce quan trọng như kiểm tra tồn kho theo variant, flash sale có quota riêng, voucher kiểm tra ở backend, COD tạo đơn ngay còn MoMo/VNPay chỉ xác nhận khi có callback thanh toán thành công. Đơn hàng cũng có luồng trạng thái theo vai trò để user, seller và admin không thao tác sai nghiệp vụ.

---

## 9. Script Demo Nói Theo Từng Màn

### Trang chủ

> Đây là trang chủ hiển thị sản phẩm và các khu vực marketing. Khi người dùng xem hoặc click sản phẩm, hệ thống ghi nhận hành vi để phục vụ đề xuất.

### Trang chi tiết sản phẩm

> Ở trang chi tiết, người dùng chọn variant. Nếu variant hết hàng thì không thể chọn để thêm vào giỏ. Bên dưới có thể có sản phẩm gợi ý liên quan dựa trên sản phẩm đang xem.

### Giỏ hàng/checkout

> Ở checkout, backend kiểm tra lại tồn kho, voucher, flash sale và giá cuối cùng. Frontend chỉ hiển thị, còn backend quyết định để tránh sai lệch dữ liệu.

### Thanh toán

> Với COD, đơn được tạo ngay sau khi xác nhận. Với MoMo/VNPay, hệ thống cần callback/IPN thành công từ cổng thanh toán rồi mới xác nhận thanh toán.

### Seller order

> Seller xử lý đơn theo đúng vai trò: xác nhận, chuẩn bị hàng, nhập đơn vị vận chuyển và mã vận đơn. Khi đơn đã gửi hàng, thông tin vận chuyển bị khóa để tránh sửa sai lịch sử.

### Admin analytics

> Trang analytics cho admin theo dõi doanh thu, top sản phẩm và vận hành recommendation. Admin có thể train lại model, đồng bộ embedding sản phẩm và xem các chỉ số như HitRate/NDCG/CTR/Conversion.

### Chatbot

> Chatbot hỗ trợ user hỏi về sản phẩm, đơn hàng, chính sách, tồn kho, flash sale, hủy/trả hàng. Khi hỏi gợi ý sản phẩm, chatbot có thể dùng dữ liệu recommendation để trả về sản phẩm phù hợp.

---

## 10. Checklist Trước Khi Demo

- Có tài khoản user, seller, admin.
- Có ít nhất vài sản phẩm active, có ảnh đẹp, variant còn hàng.
- Có một vài sản phẩm hết hàng để demo disable variant.
- Có đơn COD ở nhiều trạng thái.
- Có đơn online hoặc payment log nếu muốn nói về MoMo/VNPay.
- Có vài hành vi VIEW/CLICK/ADD_TO_CART/PURCHASE để analytics không trống.
- Có banner, voucher, flash sale mẫu.
- Có ít nhất một đơn đã giao/hoàn tất để demo review.
- Có dữ liệu recommendation để trang gợi ý không trống.

---

## 11. Câu Chốt Cuối Bài

Bạn có thể kết thúc:

> Qua đề tài này, em đã xây dựng một hệ thống thương mại điện tử có đầy đủ các luồng chính từ mua hàng, thanh toán, vận chuyển, đổi trả đến quản trị. Điểm nhấn của hệ thống là module đề xuất sản phẩm bằng AI, sử dụng dữ liệu hành vi người dùng và nhiều tín hiệu khác nhau để cá nhân hóa trải nghiệm mua sắm.

