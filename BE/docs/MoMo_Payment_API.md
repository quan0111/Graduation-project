# MoMo Payment API Documentation

## Thanh Toán Thông Thường

Thanh toán thường dùng bằng ví MoMo dành cho đối tác sử dụng các kênh bán hàng sau:
- Website trên máy tính
- Website trên di động
- Ứng dụng di động
- Thiết bị không hỗ trợ trình duyệt internet

Thanh toán thường dùng bằng ứng dụng Ngân hàng dành cho đối tác sử dụng các kênh bán hàng sau:
- Website trên máy tính
- Thiết bị không hỗ trợ trình duyệt internet

Hướng dẫn bên dưới cho bạn biết cách tích hợp phù hợp với từng nền tảng và cách hoạt động của API.

## Luồng Xử Lý

## Cấu Hình API

### HTTP Information

Lấy phương thức thanh toán

Merchant server cần gọi tới API captureWallet của MoMo để lấy các phương thức thanh toán và áp dụng cho từng nền tảng của mình.

- **requestType**: Định danh loại request
- **Thời gian timeout**: Nhỏ nhất khi gọi API này nên là 30s để đảm bảo nhận phản hồi từ server của MoMo.

### HTTP Request

```
POST /v2/gateway/api/create
```

### Request Parameters

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| partnerCode | String(50) | Yes | Thông tin tích hợp |
| subPartnerCode | String(50) | No | Định danh duy nhất của tài khoản M4B của bạn. Chỉ áp dụng cho nhóm đối tác thuộc Master Merchant, 3PSP: third party services provider |
| storeName | String | No | Tên đối tác |
| storeId | String(50) | No | Mã cửa hàng |
| requestId | String(50) | Yes | Định danh duy nhất cho mỗi yêu cầu. Đối tác sử dụng requestId để xử lý idempotency |
| amount | Long | Yes | Số tiền cần thanh toán. Nhỏ nhất: 1.000 VND, Tối đa: 50.000.000 VND. Tiền tệ: VND. Kiểu dữ liệu: Long |
| orderId | String(200) | Yes | Mã đơn hàng của đối tác |
| orderInfo | String(255) | Yes | Thông tin đơn hàng |
| orderGroupId | Long | No | orderGroupId được MoMo cung cấp để phân nhóm đơn hàng cho các hoạt động vận hành sau này. Vui lòng liên hệ với MoMo để biết chi tiết cách sử dụng |
| redirectUrl | String | Yes | Một URL của đối tác. URL này được sử dụng để chuyển trang (redirect) từ MoMo về trang mua hàng của đối tác sau khi khách hàng thanh toán. Hỗ trợ: AppLink and WebLink |
| ipnUrl | String | Yes | API của đối tác. Được MoMo sử dụng để gửi kết quả thanh toán theo phương thức IPN (server-to-server) |
| requestType | String | Yes | captureWallet |
| extraData | String(1000) | No | Giá trị mặc định là rỗng "". Encode base64 theo định dạng Json: {"key": "value"}. Ví dụ với dữ liệu: {"username":"momo","skus":"value1,value2"} thì data extraData: eyJ1c2VybmFtZSI6Im1vbW8iLCJza3VzIjoidmFsdWUxLHZhbHVlMiJ9 |
| items | List | No | Danh sách các sản phẩm hiển thị trên trang thanh toán. Tối đa: 50 loại sản phẩm |
| deliveryInfo | Object | No | Thông tin giao hàng của đơn hàng |
| userInfo | Object | No | Thông tin người dùng |
| referenceId | String(200) | No | Mã tham chiếu phụ của đối tác. Ví dụ dùng trong các trường hợp như mã khách hàng, mã hộ gia đình, mã hóa đơn, mã thuê bao v.v |
| autoCapture | Boolean | No | Nếu giá trị false, giao dịch sẽ không tự động capture. Mặc định là true |
| lang | String | No | Ngôn ngữ của message được trả về (vi hoặc en) |
| signature | String | Yes | Chữ ký để xác nhận giao dịch. Sử dụng thuật toán Hmac_SHA256 với data theo định dạng được sort từ a-z |

### Signature Format

```
accessKey=$accessKey&amount=$amount&extraData=$extraData&ipnUrl=$ipnUrl&orderId=$orderId&orderInfo=$orderInfo&partnerCode=$partnerCode&redirectUrl=$redirectUrl&requestId=$requestId&requestType=$requestType
```

### Chi tiết nội dung của items

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| id | String | Yes | SKU number |
| name | String | Yes | Tên sản phẩm |
| description | String | No | Miêu tả sản phẩm |
| category | String | No | Phân loại ngành hàng của sản phẩm |
| imageUrl | String | No | Link hình ảnh của sản phẩm |
| manufacturer | String | No | Tên nhà sản xuất |
| price | Long | Yes | Đơn giá |
| currency | String | No | VND |
| quantity | Integer | Yes | Số lượng của sản phẩm. Cần là một số lớn hơn 0 |
| unit | String | No | Đơn vị đo lường của sản phẩm này |
| totalPrice | Long | Yes | Tổng giá = Đơn giá x Số lượng |
| taxAmount | Long | No | Tổng thuế |

### Mẫu items

```json
{
  "id": "204727",
  "name": "YOMOST Bac Ha&Viet Quat 170ml",
  "description": "YOMOST Sua Chua Uong Bac Ha&Viet Quat 170ml/1 Hop",
  "category": "beverage",
  "imageUrl": "https://momo.vn/uploads/product1.jpg",
  "manufacturer": "Vinamilk",
  "price": 11000,
  "quantity": 5,
  "unit": "hộp",
  "totalPrice": 55000,
  "taxAmount": "200"
}
```

### Chi tiết nội dung của deliveryInfo

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| deliveryAddress | String | No | Địa chỉ giao hàng |
| deliveryFee | String | No | Phí giao hàng |
| quantity | String | No | Số lượng sản phẩm |

### Mẫu deliveryInfo

```json
{
  "deliveryAddress": "Phu My Hung Tower",
  "deliveryFee": "30000",
  "quantity": "2"
}
```

### Chi tiết nội dung của userInfo

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| name | String | No | Tên của người dùng |
| phoneNumber | String | No | Số điện thoại của người dùng |
| email | String | No | Email của người dùng |

### Mẫu userInfo

```json
{
  "name": "Nguyen Van A",
  "phoneNumber": "0999888999",
  "email": "email_add@domain.com"
}
```

### Điều hướng thông tin (redirectUrl)

- **WebLink**: Link để mở website
- **AppLink**: Link để mở mobile application

Tìm hiểu thêm về AppLink:
- Android: https://developer.android.com/training/app-links
- iOS: https://developer.apple.com/documentation/uikit/core_app/..

### Mẫu Request

```json
{
  "partnerCode": "MOMOT5BZ20231213_TEST",
  "requestType": "captureWallet",
  "ipnUrl": "https://example.com/momo_ip",
  "redirectUrl": "https://momo.vn/",
  "orderId": "Partner_Transaction_ID_1721725424433",
  "amount": "1000",
  "orderInfo": "Thank you for your purchase at MoMo_test",
  "requestId": "Request_ID_1721725424433",
  "extraData": "eyJza3VzIjoiIn0=",
  "signature": "5d9eae90a89b45731c7667e9056c95739eb5162a272dfc288aac6090e762b0b9",
  "lang": "en"
}
```

## HTTP Response

### Response Parameters

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| partnerCode | String | Yes | Thông tin tích hợp |
| requestId | String | Yes | Giống với yêu cầu ban đầu |
| orderId | String | Yes | Mã đơn hàng của đối tác |
| amount | Long | Yes | Giống với số tiền yêu cầu ban đầu |
| responseTime | Long | Yes | Thời gian trả kết quả thanh toán về đối tác. Định dạng: timestamp |
| message | String | Yes | Mô tả lỗi, ngôn ngữ dựa trên lang |
| resultCode | int | Yes | Result Code |
| payUrl | String | Yes | URL để chuyển từ trang mua hàng của đối tác sang trang thanh toán của MoMo |
| deeplink | String | Yes | URL để mở ứng dụng trực tiếp MoMo (Khách hàng phải cài đặt ứng dụng MoMo trước) và trang xác nhận thanh toán. Nếu bạn gặp sự cố khi mở deeplink ở android 11, vui lòng xem hướng dẫn |
| qrCodeUrl | String | Yes | Dữ liệu để tạo mã QR nếu bạn muốn khách hàng quét mã QR trực tiếp trên trang mua hàng hoặc in mã lên hoá đơn. Note: Đây không phải URL chứa hình ảnh của mã QR, bạn cần sử dụng thư viện ngoài để tạo mã QR |
| deeplinkMiniApp | String | Yes | URL mở màn hình xác nhận thanh toán của ứng dụng MoMo. Áp dụng khi đối tác sử dụng mini app nhúng vào trong ứng dụng MoMo |
| signature | String | Yes | Chữ ký để xác nhận giao dịch. Sử dụng thuật toán Hmac_SHA256 theo định dạng |
| userFee | Long | Yes | User Fee |

### Signature Response Format

```
accessKey=$accessKey&amount=$amount&orderId=$orderId&partnerCode=$partnerCode&payUrl=$payUrl&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode
```

**Lưu ý**: Trên môi trường production: Bạn cần phải xin quyền để sử dụng những trường qrCodeUrl, deeplink, deeplinkMiniApp.

### Mẫu Response

```json
{
  "partnerCode": "MOMOT5BZ20231213_TEST",
  "requestId": "Request_ID_1721725424433",
  "orderId": "Partner_Transaction_ID_1721725424433",
  "amount": 1000,
  "responseTime": 1721725425489,
  "message": "Successful.",
  "resultCode": 0,
  "payUrl": "https://test-payment.momo.vn/v2/gateway/api/create",
  "deeplink": "momo://deeplink",
  "qrCodeUrl": "https://test-payment.momo.vn/v2/gateway/api/qr",
  "deeplinkMiniApp": "momo://miniapp",
  "signature": "signature_value",
  "userFee": 0
}
```

## Thanh toán

Bạn cần cài đặt ứng dụng MoMo Test và sử dụng MoMo TEST Account để thực hiện giao dịch.

**Hướng dẫn thanh toán**: Đăng nhập ứng dụng MoMo > Màn hình chính > Quét mã.

## Xử lý kết quả thanh toán

>>> Tìm hiểu thêm về Payment Notification.

### Thông tin tham số

Mô tả các tham số được dùng bởi MoMo trong URL redirectUrl và nội dung của body ipnUrl.

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| partnerCode | String | Yes | Thông tin tích hợp |
| orderId | String | Yes | Mã đơn hàng của đối tác |
| requestId | String | Yes | requestId của đối tác |
| amount | Long | Yes | Số tiền thanh toán |
| storeId | String | No | Mã cửa hàng. Áp dụng cho QR code tĩnh |
| orderInfo | String | Yes | Thông tin đơn hàng |
| partnerUserId | String | Yes | Định danh duy nhất của MoMo cho mỗi tài khoản ví MoMo |
| orderType | String | Yes | momo_wallet |
| transId | Long | Yes | Mã giao dịch của MoMo |
| resultCode | Integer | Yes | Trạng thái giao dịch của đơn hàng. Mã Kết Quả |
| message | String | Yes | Mô tả lỗi ngôn ngữ dựa trên lang |
| payType | String | Yes | Hình thức thanh toán: webApp, app, qr hoặc miniapp. Trường hợp bạn đang sử dụng AIO QR, hình thức thanh toán sẽ là aio_qr hoặc banktransfer_qr |
| responseTime | Long | Yes | Thời gian trả kết quả thanh toán về đối tác. Định dạng: timestamp |
| extraData | String | No | Thông tin thêm |
| signature | String | Yes | Chữ ký để xác nhận giao dịch. Sử dụng thuật toán Hmac_SHA256 với data theo định dạng được sort từ a-z |
| paymentOption | String | No | Tài khoản/Thẻ đã được dùng để thanh toán giao dịch: momo, pay_later |
| userFee | Long | No | User Fee |
| promotionInfo | List | No | Thông tin khuyến mãi. Default value is null |

### Signature Notification Format

```
accessKey=$accessKey&amount=$amount&extraData=$extraData&message=$message&orderId=$orderId&orderInfo=$orderInfo&orderType=$orderType&partnerCode=$partnerCode&payType=$payType&requestId=$requestId&responseTime=$responseTime&resultCode=$resultCode&transId=$transId
```

### Details of promotionInfo

| Attribute | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | Long | Yes | Số tiền giảm giá |
| amountSponsor | Long | Yes | Số tiền giả giá merchant tham gia vào voucher/ campaign |
| voucherId | String | Yes | ID của voucher/ campaign |
| voucherType | String | Yes | Percent |
| voucherName | String | Yes | Tên voucher/ campaign |
| merchantRate | String | Yes | Tỉ lệ mà merchant tham gia vào voucher/ campaign |

### Mẫu Request IPN

```json
{
  "orderType": "momo_wallet",
  "amount": 1000,
  "partnerCode": "MOMOT5BZ20231213_TEST",
  "orderId": "Partner_Transaction_ID_1721720620078",
  "extraData": "eyJza3VzIjoiIn0=",
  "signature": "7b9f4ca728076c32f16041cbc917ebf5e6e7359f0bde343dde3add69a518cf0d",
  "transId": 4088878653,
  "responseTime": 1721720663942,
  "resultCode": 0,
  "message": "Successful.",
  "payType": "qr",
  "requestId": "Request_ID_1721720620078",
  "orderInfo": "Thank you for your purchase at MoMo_test"
}
```

## Online tools, try yourself

## Result Codes & Messages

Vui lòng tìm kiếm result codes và mô tả tương ứng của luồng Thanh toán Thông thường trong danh sách result codes tổng hợp ở đây.

### Result Codes Table

| Result Code | Message | Success | Description | Error Type |
|-------------|---------|---------|-------------|------------|
| 0 | Thành công | Yes | - | - |
| 10 | Hệ thống đang được bảo trì | No | Vui lòng quay lại sau khi bảo trì được hoàn tất | System error |
| 11 | Truy cập bị từ chối | No | Cấu hình tài khoản doanh nghiệp không cho phép truy cập. Vui lòng xem lại các thông tin đăng ký và cấu hình trên M4B, hoặc liên hệ trực tiếp với MoMo để được điều chỉnh | System error |
| 12 | Phiên bản API không được hỗ trợ cho yêu cầu này | No | Vui lòng nâng cấp lên phiên bản mới nhất của cổng thanh vì, vì phiên bản bạn đang truy cấp hiện không còn được hỗ trợ | System error |
| 13 | Xác thực doanh nghiệp thất bại | No | Vui lòng kiểm tra thông tin kết nối, bao gồm cả chữ ký mà bạn đang sử dụng, và đối chiếu với các thông tin được cung cấp từ M4B | Merchant error |
| 20 | Yêu cầu sai định dạng | No | Vui lòng kiểm tra định dạng của yêu cầu, các biến thể, hoặc tham số còn thiếu | Merchant error |
| 21 | Yêu cầu bị từ chối vì số tiền giao dịch không hợp lệ | No | Vui lòng kiểm tra số tiền hợp lệ và thực hiện lại yêu cầu | Merchant error |
| 22 | Số tiền giao dịch không hợp lệ | No | Vui lòng kiểm tra nếu số tiền thanh toán nằm trong giới hạn quy định của yêu cầu thanh toán này. Đối với yêu cầu dạng capture, hãy kiểm tra số tiền capture có bằng với số tiền đã được xác nhận trước đó hay không | Merchant error |
| 40 | RequestId bị trùng | No | Vui lòng thử lại với một requestId khác | Merchant error |
| 41 | OrderId bị trùng | No | Vui lòng truy vấn trạng thái của orderId này, hoặc thử lại với một orderId khác | Merchant error |
| 42 | OrderId không hợp lệ hoặc không được tìm thấy | No | Vui lòng thử lại với một orderId khác | Merchant error |
| 43 | Yêu cầu bị từ chối vì xung đột trong quá trình xử lý giao dịch | No | Trước khi thử lại, vui lòng kiểm tra nếu có một giao dịch khác đang được xử lý có thể hạn chế yêu cầu này được tiếp nhận, hoặc orderId được sử dụng không phù hợp với yêu cầu này | Merchant error |
| 45 | Trùng ItemId | No | Vui lòng kiểm tra và thử lại yêu cầu với ItemId duy nhất | Merchant error |
| 47 | Yêu cầu bị từ chối vì thông tin không hợp lệ trong danh sách dữ liệu khả dụng | No | Vui lòng kiểm tra và thử lại với yêu cầu khác | System error |
| 98 | QR Code tạo không thành công. Vui lòng thử lại sau | Yes | Vui lòng thử lại với yêu cầu khác | System error |
| 99 | Lỗi không xác định | Yes | Vui lòng liên hệ MoMo để biết thêm chi tiết | System error |
| 1000 | Giao dịch đã được khởi tạo, chờ người dùng xác nhận thanh toán | No | Giao vẫn đang chờ người dùng xác nhận thanh toán; trạng thái của giao dịch sẽ được tự động thay đổi ngay sau khi người dùng xác nhận hoặc hủy thanh toán | - |
| 1001 | Giao dịch thanh toán thất bại do tài khoản người dùng không đủ tiền | Yes | Vui lòng đánh dấu giao dịch này thất bại | Merchant error |
| 1002 | Giao dịch bị từ chối do nhà phát hành tài khoản thanh toán | Yes | Sự từ chối xảy ra khi thẻ được dùng để thanh toán hiện không còn khả dụng, hoặc kết nối đến hệ thống của nhà phát hành thẻ bị gián đoạn. Vui lòng tạm thời sử dụng phương thức thanh toán khác | User error |
| 1003 | Giao dịch bị đã bị hủy | Yes | Giao dịch bị hủy bởi doanh nghiệp hoặc bởi trình xử lý timeout của MoMo. Vui lòng đánh dấu giao dịch này đã bị hủy (giao dịch thất bại) | Merchant error |
| 1004 | Giao dịch thất bại do số tiền thanh toán vượt quá hạn mức thanh toán của người dùng | Yes | Vui lòng đánh dấu giao dịch này thất bại, và thử lại vào một khoảng thời gian khác | User error |
| 1005 | Giao dịch thất bại do url hoặc QR code đã hết hạn | Yes | Vui lòng gửi lại một yêu cầu thanh toán khác | System error |
| 1006 | Giao dịch thất bại do người dùng đã từ chối xác nhận thanh toán | Yes | Please send another payment request | User error |
| 1007 | Giao dịch bị từ chối vì tài khoản không tồn tại hoặc đang ở trạng thái ngưng hoạt động | Yes | Vui lòng đảm bảo trạng thái tài khoản phải được kích hoạt/ đã xác thực trước khi thực hiện lại hoặc liên hệ MoMo để được hỗ trợ | System error |
| 1017 | Giao dịch bị hủy bởi đối tác | Yes | - | Merchant error |
| 1026 | Giao dịch bị hạn chế theo thể lệ chương trình khuyến mãi | Yes | Vui lòng liên hệ MoMo để biết thêm chi tiết | System error |
| 1080 | Giao dịch hoàn tiền thất bại trong quá trình xử lý. Vui lòng thử lại trong khoảng thời gian ngắn, tốt hơn là sau một giờ | Yes | Vui lòng kiểm tra nếu orderId hoặc transId được dùng trong yêu cầu này là chính xác, sau đó thử lại yêu cầu hoàn tiền (khuyến khích thử lại sau một giờ đối với giao dịch thanh toán được thực hiện hơn một tháng trước) | Merchant error |
| 1081 | Giao dịch hoàn tiền bị từ chối. Giao dịch thanh toán ban đầu có thể đã được hoàn | Yes | Vui lòng kiểm tra nếu giao dịch thanh toán ban đầu đã được hoàn thành công, hoặc số tiền hoàn vượt quá số tiền cho phép hoàn của giao dịch thanh toán ban đầu | Merchant error |
| 1088 | Giao dịch hoàn tiền bị từ chối. Giao dịch thanh toán ban đầu không được hỗ trợ hoàn tiền | Yes | Vui lòng liên hệ MoMo để biết thêm chi tiết | Merchant error |
| 2019 | Yêu cầu bị từ chối vì orderGroupId không hợp lệ | Yes | Vui lòng liên hệ MoMo để biết thêm chi tiết | Merchant error |
| 4001 | Giao dịch bị từ chối do tài khoản người dùng đang bị hạn chế | Yes | Vui lòng liên hệ MoMo để biết thêm chi tiết | User error |
| 4002 | Giao dịch bị từ chối do tài khoản người dùng chưa được xác thực với C06 | Yes | Người dùng cần cập nhật sinh trắc học qua NFC để được phép giao dịch | User error |
| 4100 | Giao dịch thất bại do người dùng không đăng nhập thành công | Yes | - | User error |
| 7000 | Giao dịch đang được xử lý | No | Vui lòng chờ giao dịch được xử lý hoàn tất | Pending |
| 7002 | Giao dịch đang được xử lý bởi nhà cung cấp loại hình thanh toán | No | Vui lòng chờ giao dịch được xử lý. Kết quả giao dịch sẽ được thông báo ngay khi được xử lý hoàn tất | Pending |
| 9000 | Giao dịch đã được xác nhận thành công | No | Đối với thanh toán 1 bước (autoCapture=1), đây có thể xem như giao dịch thanh toán đã thành công. Đối với thanh toán 2 bước (autoCapture=0), vui lòng thực hiện tiếp yêu cầu capture hoặc cancel. Đối với liên kết, vui lòng tiến hành yêu cầu lấy recurring token | Pending |

## Xem thêm

- Kiểm tra trạng thái giao dịch
- Hoàn tiền giao dịch
- Xác nhận giao dịch

## Payment Notification

### Xử lý kết quả thanh toán

Khi việc xử lý thanh toán hoàn tất, MoMo sẽ thông báo cho đối tác ngay cả khi giao dịch này có thành công hay không.

### Giao diện (Redirect)

Sau khi luồng thanh toán hoàn tất, khách hàng được điều hướng đến redirectUrl mà bên đối tác đã cung cấp trong create request. Một vài thông số sẽ được thêm vào URL theo dạng sau:

- **Method**: GET
- **Format**: `redirectUrl?{parameters}`

### IPN - Instant Payment Notification

Hệ thống của MoMo sử dụng API được khai báo trong ipnUrl để gửi HTTP request với cấu hình bên dưới đến hệ thống đối tác.

>>> Xem thêm về IPN?

| Attribute | Value | Description |
|-----------|-------|-------------|
| URL | ipnUrl | URL |
| Method | POST | Phương thức của HTTP request |
| Headers | Content-type: application/json | HTTP Headers |
| Payload | Result Transaction | Nội dung của HTTP body |

### Mẫu Request IPN

```bash
curl --location 'https://example.com/momo_ip' \
--header 'Content-Type: application/json' \
--data '{
    "orderType": "momo_wallet",
    "amount": 1000,
    "partnerCode": "MOMOT5BZ20231213_TEST",
    "orderId": "Partner_Transaction_ID_1721720620078",
    "extraData": "eyJza3VzIjoiIn0=",
    "signature": "7b9f4ca728076c32f16041cbc917ebf5e6e7359f0bde343dde3add69a518cf0d",
    "transId": 4088878653,
    "responseTime": 1721720663942,
    "resultCode": 0,
    "message": "Successful.",
    "payType": "qr",
    "requestId": "Request_ID_1721720620078",
    "orderInfo": "Thank you for your purchase at MoMo_test"
}'
```

Response của đối tác sẽ đến MoMo sau khi MoMo gửi HTTP request đến địa chỉ ipnUrl.

**Bên đối tác cần phản hồi với HTTP code 204 (không cần gửi thêm nội dung)!**

**Lưu ý**: Đối tác cần phản hồi lại trong vòng 15 giây.

Đối tác cần kiểm tra tính hợp lệ của chữ ký trong IPN để đảm bảo kết quả của giao dịch. PartnerCode, OrderId & Amount,... trong notification phải khớp với PartnerCode, OrderId & Amount,... đối tác lưu trong database bên đó!

Field resultCode và message do đối tác xử lý. Tham chiếu đến result code mà MoMo trả về. MoMo sẽ dùng những thông tin này để phản hồi lại khách hàng nếu có bất cứ lỗi nào xảy ra trong quá trình xử lý thanh toán bên nhà đối tác.

### Trạng Thái Giao Dịch

Sử dụng field resultCode để xác định trạng thái của giao dịch:

- **resultCode = 0**: giao dịch thành công
- **resultCode = 9000**: giao dịch được cấp quyền (authorization) thành công
- **resultCode <> 0**: giao dịch thất bại

Tham khảo Result code để xác định chi tiết lỗi của giao dịch.

Trong một số trường hợp khi kiểm tra chéo số dư và dòng tiền, MoMo sẽ không sử dụng kết quả IPN từ đối tác để hoàn tiền giao dịch!

## Instant Payment Notification

Instant Payment Notification (IPN) là thông điệp được gửi từ Nhà Cung Cấp Dịch Vụ Thanh Toán - Payment Service Provider (PSP) đến Bên Sử Dụng Dịch Vụ Thanh Toán - Payment Service Consumer (PSC). Việc này sử dụng giao thức HTTP và quy trình này là bất đồng bộ.

### Tại sao sử dụng IPN

Instant Payment Notification (IPN) được sử dụng để thông báo (notify) kết quả giao dịch ngay lập tức đến PSC:

- Thanh Toán: Web, SmartTv
- Thanh Toán Trực Tuyến
- Thanh Toán Định Kỳ

Đối tác có thể sử dụng hệ thống của mình để xử lý thông tin nhận được từ PSP:

- Cập nhật trạng thái giao dịch (khuyên dùng)
- Cập nhật số dư tài khoản (nạp tiền), xuất sản phẩm, thông báo kết quả giao dịch đến ứng dụng di động,...
- Gửi hóa đơn điện tử
- Sử dụng IPN để khắc phục trường hợp thanh toán thành công nhưng người dùng không nhận được sản phẩm

**Lý do**:
- Người dùng đóng trình duyệt
- Không thể điều hướng đến trang ban đầu của đối tác: do đường truyền, hệ thống quá tải,...

### Cách thực thi IPN

Đối tác cần tạo API phía backend để 'lắng nghe' kết quả từ MoMo và cung cấp URL của API đó trong field ipnUrl.

Sau khi người dùng sử dụng thanh toán trên MoMo (web hoặc app), MoMo sẽ thông báo kết quả giao dịch ngay lập tức đến URL này. API của đối tác nhận kết quả thanh toán và tiếp tục xử lý trong hệ thống bên họ.

### Xây dựng API

- **HTTP Produces Header**: Sử dụng để MoMo gửi HTTP Request Content-Type: application/json
- **HTTP Consumers Header**: Đối tác phản hồi lại MoMo: HTTP code 204 (không cần gửi thêm nội dung)
- **Endpoint**: URL chỉ nên bao gồm đường dẫn, tham số và không chứa ký tự đặc biệt, unicode hoặc khoảng cách
