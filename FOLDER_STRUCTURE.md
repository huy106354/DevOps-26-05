# Cấu trúc Thư mục và Mục đích (Folder Structure)

Dự án Web App Quản lý Nội bộ được xây dựng trên nền tảng framework Sails.js theo kiến trúc MVC (Model-View-Controller). Dưới đây là mô tả chi tiết cấu trúc thư mục của dự án và vai trò của từng thành phần.

---

## Cấu trúc Tổng quan

```
Website-Application-Internal/
├── api/                       # Chứa logic nghiệp vụ cốt lõi của Backend
│   ├── controllers/           # Xử lý các yêu cầu HTTP (Controllers & Actions)
│   ├── helpers/               # Các hàm tiện ích dùng chung
│   ├── models/                # Định nghĩa cấu trúc bảng dữ liệu (Waterline ORM)
│   ├── policies/              # Các Middleware kiểm tra quyền truy cập (Auth & RBAC)
│   └── responses/             # Các định dạng phản hồi tùy chỉnh của server
├── assets/                    # Các tài nguyên tĩnh (Static Assets) của Frontend
│   ├── js/                    # Client-side JavaScript
│   ├── styles/                # CSS Stylesheets
│   └── images/                # Hình ảnh và biểu tượng tĩnh
├── config/                    # Cấu hình hệ thống Sails.js
├── tasks/                     # Các Grunt tasks tự động hóa (build, compile)
├── views/                     # Chứa các giao diện hiển thị (EJS templates)
│   ├── layouts/               # Layouts khung chung của hệ thống
│   ├── pages/                 # Các trang giao diện riêng cho từng module
│   └── partials/              # Các phần giao diện dùng chung (sidebar, header, footer)
├── app.js                     # Điểm khởi chạy của ứng dụng (Entry point)
├── CODE_CONVENTION.md         # Quy chuẩn đặt tên và viết code (snake_case)
├── FOLDER_STRUCTURE.md        # File mô tả cấu trúc thư mục này
└── package.json               # Quản lý thư viện và các script chạy dự án
```

---

## Chi tiết Vai trò của Từng Thư mục

### 1. Thư mục `api/` (Backend Engine)
Đây là nơi chứa toàn bộ mã nguồn xử lý logic nghiệp vụ và dữ liệu của ứng dụng.
- **`controllers/`**: Tiếp nhận yêu cầu từ client, xử lý dữ liệu và quyết định hiển thị View nào hoặc trả về kết quả JSON. Để dự án dễ bảo trì, chúng tôi sử dụng cấu trúc **Sails Actions2** độc lập được phân chia theo module nghiệp vụ cụ thể:
  - `auth/`: Xử lý đăng ký, đăng nhập, đăng xuất, phân quyền.
  - `dashboard/`: Xử lý thống kê và hiển thị màn hình tổng quan.
  - `training_class/`: Quản lý chương trình đào tạo, lớp tập huấn, điểm danh QR, cấp chứng nhận.
  - `document/`: Quản lý công văn đi/đến, quy trình chuyển xử lý, lịch sử và ý kiến chỉ đạo.
  - `crm_customer/`: Quản lý khách hàng tiềm năng, cơ hội kinh doanh, báo giá, hợp đồng.
  - `asset/`: Quản lý trang thiết bị tài sản, cấp phát/thu hồi, lịch bảo trì và kiểm kê.
- **`models/`**: Định nghĩa cấu trúc thực thể, trường dữ liệu, kiểu dữ liệu, các ràng buộc dữ liệu (validation) và mối quan hệ (associations) giữa các bảng.
- **`policies/`**: Đóng vai trò là các bức tường lửa (middleware) bảo vệ các router/action nghiệp vụ. Ví dụ, chính sách `is_logged_in.js` chặn người dùng chưa đăng nhập, `check_role.js` kiểm tra vai trò của tài khoản.
- **`helpers/`**: Chứa các hàm xử lý độc lập có tính tái sử dụng cao trong hệ thống như: mã hóa mật khẩu, tạo mã chứng nhận ngẫu nhiên, sinh mã QR bảo mật, xuất tệp dữ liệu Excel.

### 2. Thư mục `config/` (Configurations)
Chứa các tệp cấu hình cho toàn bộ hoạt động của Sails.js.
- `routes.js`: Định nghĩa ánh xạ (mapping) từ URL request (endpoints) tới các action trong controller.
- `policies.js`: Cấu hình phân quyền, xác định những action nào cần được bảo vệ bởi những policy nào.
- `datastores.js`: Cấu hình kết nối cơ sở dữ liệu. Mặc định sử dụng bộ nhớ cục bộ `sails-disk` để chạy thử nghiệm nhanh, và cấu hình sẵn PostgreSQL/MySQL cho môi trường production.
- `security.js`: Cấu hình bảo mật chống tấn công CSRF, CORS, và các thiết lập bảo mật phiên (session).

### 3. Thư mục `views/` (Frontend EJS Templates)
Chứa các tệp mã nguồn HTML kết hợp mã JavaScript phía máy chủ (Embedded JavaScript templates) để dựng giao diện hiển thị.
- **`layouts/layout.ejs`**: Tệp layout trung tâm. Tất cả các trang quản trị đều kế thừa từ layout này để giữ sự đồng bộ về thanh công cụ sidebar, header, thông báo, và thanh điều hướng.
- **`partials/`**:
  - `sidebar.ejs`: Thanh menu điều hướng bên trái, hỗ trợ thu gọn và tương thích responsive trên thiết bị di động.
  - `header.ejs`: Thanh trạng thái trên cùng, chứa ô tìm kiếm nhanh, thông báo mới nhất và thông tin tài khoản người dùng đang đăng nhập.
  - `alerts.ejs`: Khối hiển thị thông điệp thành công, lỗi, cảnh báo động trên màn hình.
- **`pages/`**: Được chia nhóm thư mục tương ứng với từng module chức năng (`auth/`, `training_class/`, `document/`, `crm_customer/`, `asset/`). Mỗi thư mục chứa các tệp hiển thị danh sách (`list.ejs`), biểu mẫu thêm/sửa (`create.ejs`/`edit.ejs`) và chi tiết hồ sơ (`view.ejs`).

### 4. Thư mục `assets/` (Static Assets)
Chứa các tài nguyên tĩnh được gửi trực tiếp đến trình duyệt của người dùng.
- **`styles/main.css`**: Hệ thống CSS tùy chỉnh thuần (Vanilla CSS) xây dựng bộ nhận diện giao diện quản trị. Nó định nghĩa bảng màu phong phú (bằng các biến HSL), font chữ hiện đại (Google Fonts Outfit/Inter), giao diện chế độ tối (dark mode), hiệu ứng bóng mờ (glassmorphism), và thiết kế responsive thích ứng tốt từ màn hình điện thoại đến máy tính.
- **`js/`**: Chứa các thư viện hỗ trợ phía client (như vẽ biểu đồ động, quét mã QR điểm danh, xử lý biểu mẫu Ajax).
