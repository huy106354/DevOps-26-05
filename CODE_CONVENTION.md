# Chuẩn Giao Ước Viết Code (Code Convention) - Dự án VN168

Tài liệu này định nghĩa các quy tắc và tiêu chuẩn viết code (Coding Standards) được áp dụng thống nhất trong toàn bộ dự án Hệ thống Quản lý Nội bộ VN168. Toàn bộ mã nguồn phải tuân thủ nghiêm ngặt chuẩn **snake_case** theo yêu cầu của dự án.

---

## 1. Quy tắc đặt tên (Naming Conventions)

### 1.1. Tệp tin và Thư mục (Files & Folders)
- **Tên thư mục**: Sử dụng `snake_case` hoàn toàn (ví dụ: `training_class/`, `crm_customer/`).
- **Tên file Controllers/Actions**: Sử dụng `snake_case` (ví dụ: `api/controllers/training_class/create_class.js`, `api/controllers/auth/register_user.js`).
- **Tên file Models**: Đặt tên theo dạng CamelCase của SailsJS (ví dụ: `User.js`, `TrainingClass.js`), tuy nhiên **tên bảng trong cơ sở dữ liệu** và **các thuộc tính (attributes)** bắt buộc phải dùng `snake_case`.
- **Tên file Views (EJS)**: Sử dụng `snake_case` (ví dụ: `views/pages/training_class/list_classes.ejs`).

### 1.2. Biến số và Hàm (Variables & Functions)
- **Biến cục bộ & Tham số**: Sử dụng `snake_case` (ví dụ: `let user_record = ...`, `const trainee_email = req.param('email')`).
- **Hàm số & Phương thức**: Sử dụng `snake_case` (ví dụ: `async function generate_certificate_code(...)`, `class_details()`).
- **Hằng số (Constants)**: Sử dụng `UPPER_SNAKE_CASE` (ví dụ: `const MAX_LOGIN_ATTEMPTS = 5`).

### 1.3. Mô hình dữ liệu (Waterline Models)
- **Tên thuộc tính (Attributes)**: Tất cả các trường dữ liệu (columns) trong model bắt buộc phải dùng `snake_case`.
  ```javascript
  // Ví dụ trong api/models/TrainingClass.js
  attributes: {
    class_code: { type: 'string', required: true, unique: true },
    start_time: { type: 'ref', columnType: 'timestamp' },
    coordinating_unit: { type: 'string' }
  }
  ```
- **Khóa ngoại & Quan hệ**: Đặt tên thuộc tính quan hệ bằng danh từ số ít kèm `_id` hoặc tên quan hệ ở dạng `snake_case` (ví dụ: `program_id`, `trainee_records`).

---

## 2. Quy tắc lập trình & Cấu trúc mã nguồn

### 2.1. Quản lý Bất đồng bộ (Async/Await)
- Tuyệt đối không dùng callback lồng nhau (Callback Hell). Sử dụng cú pháp `async/await` kết hợp với `try/catch` để bắt lỗi rõ ràng ở mọi hành động.
- Tránh bỏ qua lỗi (empty catch blocks). Mọi lỗi hệ thống phải được ghi nhận (logged) và trả về thông báo an toàn, dễ hiểu cho người dùng.

### 2.2. Kiểm soát dữ liệu đầu vào (Validation & Edge Cases)
- Tất cả các API/Action tiếp nhận dữ liệu từ người dùng phải thực hiện kiểm tra tính hợp lệ (validation) trước khi xử lý:
  - Kiểm tra trường bắt buộc không được rỗng.
  - Định dạng email, số điện thoại phải chính xác.
  - Ràng buộc trùng lặp dữ liệu (Unique constraints) như Email, Số điện thoại, Mã lớp, Số công văn phải được truy vấn kiểm tra trước để tránh lỗi database crash.
- Dữ liệu trả về khi có lỗi nhập liệu phải rõ ràng, chỉ rõ trường nào bị lỗi và lỗi gì để hiển thị trực tiếp lên UI (hiển thị ngay dưới trường nhập liệu).

### 2.3. Bảo mật hệ thống
- **Mật khẩu**: Bắt buộc phải mã hóa bằng `bcryptjs` trước khi lưu vào cơ sở dữ liệu. Độ muối (salt rounds) khuyến nghị là `10`.
- **Phân quyền route (RBAC)**: Phải sử dụng Policy để kiểm tra quyền ở tầng backend. Không được chỉ ẩn nút trên giao diện người dùng.
- **Tải lên tệp tin (File Upload)**:
  - Chỉ cho phép tải lên các định dạng tệp an toàn (ví dụ: `.pdf`, `.doc`, `.docx`, `.xlsx`, `.jpg`, `.png`).
  - Giới hạn dung lượng tải lên tối đa là 10MB để tránh tấn công từ chối dịch vụ (DoS).
  - Tên tệp tin khi lưu trữ phải được thay đổi bằng uuid hoặc định dạng timestamp kết hợp tên an toàn để tránh ghi đè và tấn công path traversal.

### 2.4. Audit Log & Truy vết
- Mọi hoạt động quan trọng ảnh hưởng đến hệ thống (ví dụ: Cấp phát tài sản, chuyển giao công văn, sinh mã chứng nhận, duyệt báo giá, thay đổi vai trò người dùng) bắt buộc phải ghi lại nhật ký (Audit Log) vào bảng `audit_log` với đầy đủ thông tin: ai làm, hành động gì, bản ghi nào, dữ liệu trước và sau khi thay đổi.
