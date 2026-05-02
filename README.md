# CFA Level 1 Mastery Suite 🎓

![CFA Level 1 Mastery](https://img.shields.io/badge/Status-Active-success)
![Node](https://img.shields.io/badge/Node.js-v20+-green)
![React](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
![Vite](https://img.shields.io/badge/Vite-6-purple)

Chào mừng bạn đến với **CFA Level 1 Mastery Suite** - nền tảng tự học và ôn thi chứng chỉ CFA Level 1 thông minh, hiện đại. Ứng dụng tích hợp sức mạnh của Trí tuệ Nhân tạo (Google Gemini AI) để giúp bạn phân tích tài liệu học tập, sinh câu hỏi tự động và có luôn một "Gia sư AI" giải thích cặn kẽ từng vấn đề.

📚 Đọc chi tiết về **[Tech Stack & Architecture](./TECHSTACK.md)** để hiểu cấu trúc công nghệ của dự án.

## 🚀 Tính năng nổi bật

- 🧠 **Gia Sư AI (AI Tutor)**: Giải thích chi tiết bằng tiếng Việt tại sao bạn chọn đúng hay sai, và cung cấp gợi ý ôn tập kiến thức nền tảng.
- 📂 **Quản lý Ngân hàng Câu hỏi**: Dễ dàng upload tài liệu (file `.json`, `.txt` format chuẩn) để tự động import câu hỏi trắc nghiệm vào hệ thống.
- 🎯 **Luyện tập Chuyên sâu & Tổng hợp**: Chế độ làm bài test 30 câu ngẫu nhiên tổng hợp hoặc luyện tập riêng theo từng trong số 10 môn học của CFA.
- 📊 **Dashboard Thống kê**: Theo dõi trực quan điểm số, tiến độ học tập và lịch sử làm bài thông qua biểu đồ sinh động.
- ⚡ **Offline-first & Local DB**: Hoạt động hoàn toàn trên máy tính cá nhân bằng SQLite, tốc độ xử lý siêu nhanh, không lo mất dữ liệu.

## 🛠️ Hướng dẫn Cài đặt & Khởi chạy

### Bước 1: Yêu cầu hệ thống
- Đã cài đặt **Node.js** (phiên bản v18 hoặc v20+). Tải tại: [nodejs.org](https://nodejs.org/)
- Đã cài đặt Git (để clone dự án).

### Bước 2: Tải Source Code & Cài đặt thư viện
Mở Terminal/Command Prompt và chạy các lệnh sau:

```bash
# Clone dự án về máy
git clone <url-repo-cua-ban>
cd cfa-level-1-mastery

# Cài đặt toàn bộ thư viện cần thiết
npm install
```

### Bước 3: Cấu hình Gemini API Key
Để tính năng Gia sư AI hoạt động, bạn cần cấu hình khóa API của Google Gemini.
1. Tạo một file tên là `.env` ở thư mục gốc của dự án.
2. Thêm khóa API của bạn vào file `.env`:
   ```env
   GEMINI_API_KEY="ĐIỀN_API_KEY_CỦA_BẠN_VÀO_ĐÂY"
   ```
   *(Bạn có thể lấy API Key hoàn toàn miễn phí tại [Google AI Studio](https://aistudio.google.com/app/apikey))*

### Bước 4: Chạy Ứng dụng
Khởi động máy chủ phát triển (Vite + Express):

```bash
npm run dev
```

Sau khi máy chủ khởi động thành công, mở trình duyệt và truy cập: **`http://localhost:3000`**

---

## 📂 Danh sách 10 môn học CFA Level 1 hỗ trợ
Hệ thống phân loại câu hỏi dựa trên tiêu chuẩn 10 môn học của Viện CFA:
1. **ETH**: Ethics and Professional Standards
2. **QM**: Quantitative Methods
3. **ECON**: Economics
4. **FSA**: Financial Statement Analysis
5. **CI**: Corporate Issuers
6. **EQ**: Equity Investments
7. **FI**: Fixed Income
8. **DER**: Derivatives
9. **AI**: Alternative Investments
10. **PM**: Portfolio Management

## 💡 Lưu ý cho người sử dụng
- **Về File Upload:** Hệ thống hiện hỗ trợ file `.json` hoặc file `.txt` được định dạng chuẩn (xem ví dụ trong mục Upload).
- **Về API Key:** Nếu ứng dụng báo lỗi "Lỗi kết nối AI" hoặc "Gemini API Key", hãy kiểm tra lại file `.env` và chắc chắn bạn đã cấu hình đúng.
- **Về Ngôn ngữ:** Các câu hỏi trắc nghiệm sẽ được hiển thị bằng **Tiếng Anh** (chuẩn format bài thi thật của CFA), nhưng phần giải thích của Gia sư AI sẽ dùng **Tiếng Việt** để bạn dễ dàng nắm bắt kiến thức cốt lõi nhanh chóng.

---
*Chúc bạn ôn thi CFA hiệu quả và đạt kết quả cao nhất! 🚀*
