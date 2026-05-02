# 🛠️ Tech Stack & Architecture

Dự án được thiết kế theo kiến trúc **Full-stack Monorepo**, gộp chung Frontend (FE) và Backend (BE) chạy trên cùng một tiến trình NodeJS thông qua cơ chế SSR/Middleware của Vite. Điều này giúp tối ưu hóa việc phát triển và triển khai ứng dụng.

Dưới đây là chi tiết về các công nghệ, thư viện và công cụ được sử dụng:

## 1. Môi trường chạy & Công cụ phát triển (DevTools)
- **NodeJS (v20.18.0)**: Môi trường Runtime chính.
- **TypeScript (~5.8.2)**: Ngôn ngữ lập trình chính cho cả Frontend và Backend, giúp kiểm soát lỗi chặt chẽ.
- **Vite (v6.2.3)**: Công cụ build cực nhanh, đóng vai trò bundle cho Frontend và hỗ trợ middleware cho server.
- **vite-node (v5.1.0)**: Công cụ thực thi code TypeScript trực tiếp, thay thế cho `tsx` để tránh đụng độ module ảo của Vite.

## 2. Frontend (Giao diện người dùng)
Mảng Frontend được xây dựng hướng tới hiệu năng cao, giao diện hiện đại và trải nghiệm người dùng (UX) mượt mà:
- **Core Framework**:
  - `react` (^19.0.1): Thư viện UI cốt lõi phiên bản mới nhất.
  - `react-dom` (^19.0.1)
- **Routing**:
  - `react-router-dom` (^7.14.2): Xử lý điều hướng trang (SPA routing).
- **Styling (Giao diện & CSS)**:
  - `tailwindcss` (^4.1.14): Framework CSS tiện ích (phiên bản v4 mới nhất) kết hợp với `@tailwindcss/vite`.
  - `clsx` (^2.1.1) & `tailwind-merge` (^3.5.0): Quản lý và linh hoạt ghép nối các class CSS mà không bị xung đột (thường dùng qua hàm `cn()`).
- **UI Components & Hiệu ứng**:
  - `lucide-react` (^0.546.0): Thư viện icon SVG hiện đại, tinh gọn.
  - `motion` (Framer Motion) (^12.23.24): Xử lý các hiệu ứng chuyển động (animation) mượt mà và tương tác nâng cao.
  - `recharts` (^3.8.1): Vẽ biểu đồ thống kê trực quan cho bảng điều khiển (Dashboard).

## 3. Backend (Máy chủ xử lý)
Backend đóng vai trò cung cấp API, xử lý tệp tin và tích hợp Trí tuệ nhân tạo (AI):
- **Core Server**:
  - `express` (^4.21.2): Framework web server phổ biến và ổn định của NodeJS.
  - `cors` (^2.8.6): Xử lý bảo mật Cross-Origin Resource Sharing cho API.
  - `dotenv` (^17.2.3): Quản lý các biến môi trường cấu hình (như API keys) một cách an toàn.
- **Xử lý Tệp tin (Files)**:
  - `multer` (^2.1.1): Middleware chuyên dụng để tiếp nhận và xử lý file upload từ client.
  - `pdf-parse` (^2.4.5): Công cụ dùng để trích xuất văn bản (text) từ các file PDF tài liệu học tập.
- **Trí tuệ nhân tạo (AI Integration)**:
  - `@google/genai` (^1.29.0): SDK chính thức của Google, dùng để kết nối với Gemini AI nhằm mục đích tự động tạo ra câu hỏi trắc nghiệm từ nội dung file text/PDF và làm gia sư AI giải thích bài tập.

## 4. Database (Cơ sở dữ liệu)
- **Hệ quản trị CSDL**: **SQLite** - Database dạng file cục bộ (`cfa.db`), siêu nhẹ, không cần cài đặt hoặc duy trì server DB rời.
- **Thư viện tương tác (Driver)**:
  - `better-sqlite3` (^12.9.0): Một trong những thư viện SQLite cho NodeJS nhanh nhất hiện nay vì chạy đồng bộ (synchronous) trên nền C++ thay vì bất đồng bộ.
