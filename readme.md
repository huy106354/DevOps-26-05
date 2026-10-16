

## 🛠️ PHƯƠNG PHÁP 1: KHỞI CHẠY THỦ CÔNG (MANUAL STARTUP)

Phương pháp này tối ưu nhất cho việc phát triển nhanh (Development), không yêu cầu cài đặt PostgreSQL và Redis trên hệ thống máy chủ vật lý vật lý nhờ cơ chế tự động chuyển đổi của hệ thống (sails-disk & in-memory cache).

### 1. Yêu cầu hệ thống
- **Node.js**: Phiên bản Node.js 24 trở lên (khuyên dùng v24.13.x).
- **npm**: Trình quản lý thư viện Node (đi kèm khi cài đặt Node.js).        

### 2. Các bước khởi chạy
1. Mở cửa sổ dòng lệnh (Terminal/Command Prompt) tại thư mục dự án:
   ```bash
   cd Website-Application-Internal
   ```
2. Cài đặt các thư viện phụ thuộc của Sails.js:
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ Sails.js ở chế độ phát triển:
   ```bash
   node app.js
   ```
4. Truy cập giao diện ứng dụng trên trình duyệt web tại địa chỉ:
   ```
   http://localhost:1337
   ```
5. Đăng ký tài khoản mới (`/auth/register`), lựa chọn vai trò (Admin, Cán bộ đào tạo, Văn thư, v.v...) và tiến hành đăng nhập để kiểm thử toàn bộ 4 Module!

---

## 🐳 PHƯƠNG PHÁP 2: KHỞI CHẠY BẰNG DOCKER (CONTAINERIZED SETUP)

Phương pháp này mô phỏng môi trường chạy thực tế (Production), tự động khởi chạy và liên kết 3 dịch vụ: Web App (Node 24 Alpine), PostgreSQL 17 và Redis 7.

### 1. Yêu cầu hệ thống
- Cài đặt **Docker** và **Docker Compose** (hoặc Docker Desktop).

### 2. Quy hoạch cổng kết nối (Port Mapping)
Để tránh đụng độ với các dịch vụ đang chạy trên máy chủ vật lý của bạn, các cổng dịch vụ bên ngoài đã được ánh xạ như sau:
- **Web App**: `http://localhost:1337` (Cổng 1337).
- **PostgreSQL 17**: Cổng host vật lý `5426` (Ánh xạ vào container cổng `5432`).
- **Redis 7**: Cổng host vật lý `6376` (Ánh xạ vào container cổng `6379`).

### 3. Các bước khởi chạy
1. Mở Terminal tại thư mục gốc của dự án:
   ```bash
   cd Website-Application-Internal
   ```
2. Tiến hành build và nâng cấp đồng loạt các container dịch vụ ngầm:
   ```bash
   docker-compose up --build
   ```
   *(Hoặc sử dụng `docker compose up --build` tùy phiên bản Docker của bạn).*
3. Chờ đợi trong giây lát để Docker tải các image Alpine, biên dịch mã nguồn Node.js, đồng bộ dữ liệu và khởi động server. Khi thấy dòng chữ chào mừng của Sails.js xuất hiện là máy chủ đã sẵn sàng.
4. Truy cập trình duyệt tại địa chỉ quen thuộc:
   ```
   http://localhost:1337
   ```
5. Để tắt ứng dụng và dọn dẹp tài nguyên container, nhấn `<Ctrl> + C` rồi chạy lệnh:
   ```bash
   docker-compose down
   ```

---

## ⚙️ CẤU HÌNH BIẾN MÔI TRƯỜNG (ENVIRONMENT VARIABLES)

Hệ thống hỗ trợ nạp cấu hình linh hoạt thông qua các biến môi trường (Ví dụ trong tệp `.env` hoặc cấu hình Docker):
- `DB_ADAPTER`: Trình kết nối CSDL. Mặc định `sails-disk` (dữ liệu lưu vào tệp tin `.tmp/localDiskDb.db`). Đổi sang `sails-postgresql` để lưu vào Postgres.
- `DATABASE_URL`: Đường dẫn kết nối CSDL PostgreSQL (Ví dụ: `postgresql://postgres:vn168_secret_password@db:5432/vn168_internal_db`).
- `REDIS_URL`: Đường dẫn kết nối Cache Redis (Ví dụ: `redis://cache:6379`).
- `PORT`: Cổng khởi chạy ứng dụng web. Mặc định `1337`.

BTVN 1
 ![Screenshot](/assets/images/image.png)