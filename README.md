# FabricNote Pro - Tool Chèn Note Bảng Màu Vải Tự Động & Siêu Tốc
*Make by Huong Lavie*

Công cụ chuyên dụng dành cho shop vải, xưởng may và đại lý vải để chốt đơn, gắn note cây vải và xuất ảnh gửi khách hàng qua Zalo chỉ trong 5 giây.

---

## 🚀 Cách mở App
1. **Cách 1 (Nhanh nhất):** Nhấp đúp chuột vào file `Mo_App.command` hoặc mở trực tiếp file `index.html` bằng trình duyệt (Chrome, Safari, Cốc Cốc, Edge).
2. **Cách 2 (Đang chạy sẵn trên máy):** Truy cập vào đường dẫn:
   👉 **http://localhost:3030**

---

## ✨ Các tính năng nổi bật

### 1. Nạp ảnh bảng màu cực tiện
- **Dán trực tiếp từ Zalo (`Ctrl+V` / `Cmd+V`)**: Copy ảnh từ tin nhắn Zalo rồi bấm dán thẳng vào app, không cần lưu về máy.
- **Kéo thả ảnh hoặc Bấm để chọn file**.
- **Nút "Ảnh mẫu demo"**: Tải ngay ảnh bảng màu mẫu để thử nghiệm.

### 2. Dán tin nhắn đơn hàng & Tự động phân tích
Dán toàn bộ tin nhắn khách gửi, ví dụ:
```text
C Dung
Thun loang 822-10#
Đen 1 cây
Trắng 1 cây
Xám rêu 08: 1 cây
```
- App tự động trích xuất:
  - **Tên khách:** `C Dung`
  - **Mã vải:** `Thun loang 822-10#`
  - **Danh sách màu & số lượng:** `[Đen: 1c]`, `[Trắng: 1c]`, `[Xám rêu 08: 1c]`.

### 3. Gắn Note thông minh & Chuẩn mẫu 100%
- **Khung đỏ tiêu đề**: Tự sinh góc trên (Tên khách + Mã vải). Có thể kéo di chuyển vị trí tùy ý.
- **Dấu Tick đỏ $(\checkmark)$ + Tem vàng số cây $[1c]$**:
  - Chạm / Click vào bất kỳ ô màu nào trên ảnh $\rightarrow$ Note tự động đóng dấu ngay lập tức.
  - Có thể chọn nhanh số lượng: `1c`, `2c`, `3c`, `5c` hoặc gõ tùy chỉnh (ví dụ: `50kg`, `10 cây`).
  - **Bấm vào note trên ảnh** để sửa số lượng hoặc xóa bỏ.
  - **Kéo thả (Drag & Drop)** để căn chỉnh vị trí dấu tick chuẩn từng milimet.
  - Hỗ trợ phím tắt: `Ctrl+Z` (Hoàn tác), phím `Delete` (Xóa note đang chọn).

### 4. Xuất ảnh & Gửi khách siêu tốc
- **"Copy gửi Zalo"**: 1 click là ảnh được sao chép vào bộ nhớ tạm $\rightarrow$ Sang Zalo bấm `Ctrl+V` gửi ngay, không tốn dung lượng ổ cứng.
- **"Tải ảnh về"**: Tải ảnh PNG chất lượng cao, độ phân giải gốc 100% không bị mờ vỡ nét.

---

## 🌐 Hướng dẫn đẩy lên Vercel

### Cách 1: Chạy 1-Click (Nhanh nhất)
- Nhấp đúp chuột vào file `Deploy_Vercel.command`.
- Cửa sổ Terminal sẽ mở ra và tự động chạy triển khai. Nếu chưa đăng nhập, trình duyệt sẽ mở để bạn xác thực tài khoản Vercel. Nhấn `Enter` theo hướng dẫn là xong!

### Cách 2: Triển khai qua lệnh Terminal
```bash
cd "/Users/macbook/Downloads/CV_Update/Lavie/App chèn note tự động"
npx vercel --prod
```

### Cách 3: Đẩy lên GitHub rồi kết nối Vercel
1. Đẩy code lên GitHub repository:
   ```bash
   git remote add origin <link-repo-github-cua-ban>
   git branch -M main
   git push -u origin main
   ```
2. Truy cập [vercel.com](https://vercel.com) $\rightarrow$ Bấm **Add New Project** $\rightarrow$ Chọn repo trên GitHub $\rightarrow$ Bấm **Deploy**.

