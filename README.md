# Kiểm thử chức năng Dự án Hệ thống Phòng khám (Clinic System)

Repo này được sử dụng để thực hiện và lưu trữ các hoạt động kiểm thử chức năng (Function Testing) cho dự án đồ án.

## 📌 Mục đích
- Kiểm tra các tính năng chính của hệ thống (Backend & Frontend).
- Thực thi các bộ test case theo kế hoạch SQA.
- Đảm bảo chất lượng các dịch vụ tích hợp (Gemini AI, Chatbot, Thanh toán VNPAY).

## 📂 Cấu trúc Repo
- **Dental-Clinic-Backend/**: Mã nguồn máy chủ và các bộ kiểm thử API (Node.js/Express).
- **Clinic-System-Frontend/**: Giao diện người dùng và kiểm thử giao diện (React/Vue/HTML...).
- **tests/**: Chứa các file kiểm thử tự động (Unit test, Integration test).

## 🛠 Công nghệ sử dụng trong kiểm thử
- **Testing Framework**: Jest / Supertest (dựa trên các file `.test.js` hiện có).
- **Kỹ thuật**: Black-box testing (Phân vùng tương đương, Giá trị biên).

## 📝 Ghi chú
- Repo này dùng để phục vụ quá trình báo cáo môn Đảm bảo chất lượng phần mềm (SQA).
- Mọi thay đổi về mã nguồn và kết quả kiểm thử sẽ được cập nhật liên tục tại đây.






# Clinic System

Hướng dẫn này dùng để chạy toàn bộ dự án gồm:

- `Dental-Clinic-Backend`: Node.js + Express + MongoDB
- `Clinic-System-Frontend`: React + Vite

## Yêu cầu môi trường

- Node.js `18+` hoặc `20+`
- npm `9+`
- MongoDB chạy local

## Cấu trúc thư mục

- [Dental-Clinic-Backend](/d:/Đồ%20án%20D21/Back-end/Dental-Clinic-Backend)
- [Clinic-System-Frontend](/d:/Đồ%20án%20D21/Back-end/Clinic-System-Frontend)

## 1. Tạo database MongoDB

### Cách 1: Cài MongoDB local

1. Cài MongoDB Community Server.
2. Khởi động MongoDB.
3. Tạo database tên `Healthcare`.

Chuỗi kết nối local mặc định:

```env
MONGO_URL=mongodb://localhost:27017/Healthcare
```

### Cách 2: Dùng Docker

Chạy MongoDB bằng Docker:

```powershell
docker run -d --name clinic-mongo -p 27017:27017 mongo:6
```

Sau đó dùng chuỗi kết nối:

```env
MONGO_URL=mongodb://localhost:27017/Healthcare
```

## 2. Cấu hình backend

Di chuyển vào thư mục backend:

```powershell
cd Dental-Clinic-Backend
```

Cài thư viện:

```powershell
npm install
```

Tạo file `.env` trong thư mục `Dental-Clinic-Backend` với nội dung mẫu:

```env
MONGO_URL=mongodb://localhost:27017/Healthcare
PORT=3000
FRONTEND_URL=http://localhost:8000

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

CLOUD_NAME=your_cloudinary_name
CLOUD_KEY=your_cloudinary_key
CLOUD_SECRET=your_cloudinary_secret

EMAIL_USER=your_email
EMAIL_PASSWORD=your_email_app_password

OPENAI_API_KEY=your_openai_key
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
DEEPSEEK_API_KEY=your_deepseek_key
GEMINI_API_KEY=your_gemini_key
GROK_API_KEY=your_grok_key

VNP_TMN_CODE=your_vnp_tmn_code
VNP_HASH_SECRET=your_vnp_hash_secret
VNP_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNP_API=https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
VNP_RETURN_URL=http://localhost:3000/invoices/vnpay/return
```

Ghi chú:

- Chỉ `MONGO_URL`, `PORT`, `FRONTEND_URL`, `JWT_SECRET` là tối thiểu để backend chạy cơ bản.
- Các biến Cloudinary, email, AI, VNPAY chỉ cần khi dùng đúng chức năng tương ứng.
- Không commit file `.env` chứa khóa thật lên Git.

## 3. Seed dữ liệu mẫu

Trong thư mục `Dental-Clinic-Backend`, chạy:

```powershell
node seed-db.js
```

Script sẽ:

- Xóa dữ liệu cũ trong database `Healthcare`
- Tạo role, tài khoản mẫu, chuyên khoa, thuốc, lịch bác sĩ, lịch hẹn, hồ sơ sức khỏe, đơn thuốc

Tài khoản mẫu sau khi seed:

- Admin: `admin@healthcare.vn` / `admin123`
- Doctor: `doctor1@healthcare.vn` / `doctor123`
- Receptionist: `receptionist@healthcare.vn` / `receptionist123`
- Patient: `patient1@healthcare.vn` / `patient123`

## 4. Chạy backend

Trong thư mục `Dental-Clinic-Backend`, chạy:

```powershell
npm start
```

Backend sẽ chạy tại:

```text
http://localhost:3000
```

## 5. Cấu hình frontend

Mở terminal mới, di chuyển vào thư mục frontend:

```powershell
cd Clinic-System-Frontend
```

Cài thư viện:

```powershell
npm install
```

Frontend hiện đang mặc định gọi API tới:

```text
http://localhost:3000
```

Nếu bạn muốn đổi API server, có thể sửa file [Api.ts](/d:/Đồ%20án%20D21/Back-end/Clinic-System-Frontend/src/services/Api.ts).

## 6. Chạy frontend

Trong thư mục `Clinic-System-Frontend`, chạy:

```powershell
npm run dev
```

Frontend sẽ chạy tại:

```text
http://localhost:8000
```

## 7. Thứ tự chạy dự án

1. Khởi động MongoDB
2. Tạo file `.env` cho backend
3. Chạy `node seed-db.js`
4. Chạy backend bằng `npm start`
5. Chạy frontend bằng `npm run dev`
6. Truy cập `http://localhost:8000`

## 8. Kiểm tra nhanh

Sau khi chạy xong:

1. Mở `http://localhost:8000`
2. Đăng nhập bằng một trong các tài khoản mẫu
3. Nếu frontend không gọi được API, kiểm tra backend có đang chạy ở cổng `3000`
4. Nếu backend không kết nối được DB, kiểm tra `MONGO_URL` và MongoDB service

## 9. Lệnh hữu ích

Backend:

```powershell
cd Dental-Clinic-Backend
npm start
npm test
node seed-db.js
```

Frontend:

```powershell
cd Clinic-System-Frontend
npm run dev
npm run build
```

## 10. Một số lỗi thường gặp

### `MONGO_URL is not defined`

Chưa tạo file `.env` hoặc thiếu biến `MONGO_URL`.

### `EADDRINUSE`

Cổng `3000` hoặc `8000` đang bị ứng dụng khác sử dụng.

### Frontend vào được nhưng không gọi được API

- Kiểm tra backend đã chạy chưa
- Kiểm tra CORS trong backend đang cho phép `http://localhost:8000`

### Seed lỗi vì không kết nối được MongoDB

- Kiểm tra MongoDB đã bật chưa
- Kiểm tra đúng database URL trong `.env`

## 11. Gợi ý môi trường phát triển

- Backend: `http://localhost:3000`
- Frontend: `http://localhost:8000`
- MongoDB: `mongodb://localhost:27017/Healthcare`