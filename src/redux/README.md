# redux/

Chỗ đặt store và slices khi dự án cần global state phức tạp.

Chưa cài thư viện — khi cần, chạy:

```bash
npm install @reduxjs/toolkit react-redux
```

rồi tạo `store.ts` + `slices/<ten>Slice.ts` ở đây. Với state đơn giản (user đăng nhập, theme) ưu tiên dùng `src/context/` trước, chỉ dùng Redux khi state nhiều nơi ghi/đọc.
