# IU-Club — Frontend

Web frontend của IU-Club, xây dựng với **React 19 + TypeScript + Vite + TailwindCSS 3**, theme **Neumorphism (Soft UI)** (spec đầy đủ tại `docs/reqcss.md` ở repo gốc).

---

## 1. Bắt đầu

### Clone code

```bash
git clone <repo-url>
cd frontend
```

### Cài thư viện

```bash
npm install
```

Script `prepare` tự trỏ git hooks về `.githooks/` sau bước này (xem mục 5).

### Cấu hình môi trường

```bash
cp .env.example .env
```

Sửa `.env` cho đúng backend: `VITE_API_URL` (mặc định `http://localhost:3456/api/v1`), `DEV_PORT`, `WEB_PORT`. Chưa có `.env` thì frontend không gọi được API.

### Chạy web (dev)

```bash
npm run dev
```

Mở địa chỉ Vite in ra (mặc định `http://localhost:5173`). Tailwind chạy qua PostCSS trong Vite — **không cần** build CSS thủ công, sửa class là HMR tự cập nhật.

### Các lệnh khác

| Lệnh | Mô tả |
| --- | --- |
| `npm run build` | Build production (chạy `tsc` type-check rồi `vite build` ra `dist/`) |
| `npm run preview` | Xem thử bản build production |
| `npm run lint` | Chạy ESLint |

---

## 2. Cấu trúc thư mục

```
src/
├── api/          # client.ts — fetch wrapper dùng chung (KHÔNG phải axios)
├── assets/       # Ảnh, icon, static files
├── components/   # Component DÙNG CHUNG toàn app
│   └── ui/       # Component nguyên tử theo theme: Button, Card, Input, Modal, Tabs...
├── constants/    # Hằng số dùng chung (routes, navigation, enums, config)
├── context/      # React Context (AuthContext, PortalUiContext, PreferencesContext, ToastContext)
├── hooks/        # Custom hooks dùng chung (useCountUp...)
├── layouts/      # Layout bọc page: AdminLayout (sidebar/header cho cả 4 role)
├── pages/        # Mỗi TRANG là một thư mục — xem quy tắc bên dưới
├── redux/        # Placeholder rỗng — state hiện dùng Context, chưa cài Redux
├── services/     # Logic gọi API theo domain (userService, clubService...)
├── types/        # TypeScript types/interfaces dùng chung
├── utils/        # Hàm tiện ích thuần (formatDate, validate...)
├── index.css     # Tailwind entry + component classes (neu-btn, neu-card...)
├── App.tsx       # Root component, khai báo routes
└── main.tsx      # Entry point
```

### Kiến trúc tổng quan (đọc trước khi thêm trang/gọi API)

- **Điều hướng portal** — `App.tsx` chỉ có vài route công khai + **4 route wildcard** `/admin/*` · `/leader/*` · `/member/*` · `/candidate/*`, cả 4 dùng chung một `AdminPortal` + `AdminLayout`. Trang con thật do `renderPortalPage(path)` (`src/routes/portalRoutes.tsx`) tra từ `PAGE_MAP`, riêng trang chi tiết match bằng regex. **URL là nguồn điều hướng duy nhất.** Thêm trang mới = khai `ROUTES` (`constants/routes.ts`) → thêm mục `SIDEBAR_CONFIG` (`constants/navigation.ts`) → map vào `PAGE_MAP`.
- **Xác thực** — mọi request đi qua object `api` trong `src/api/client.ts` (fetch wrapper, envelope `{ success, message, data }`). Access token ở `sessionStorage`, refresh token là cookie httpOnly; 401 sẽ tự refresh 1 lần rồi retry. `AuthContext` giữ user; role backend `bcn` map thành `admin`; cờ `roles[]`/`isMentor`/`requirePasswordChange` chi phối guard trong `AdminPortal`.
- **Gọi API** — mỗi domain một file trong `src/services/`, map `BackendXxx` DTO → type frontend rồi gọi qua `api`. **Component không tự fetch.**
- **State toàn cục** — React Context (`Auth`, `PortalUi`, `Preferences`, `Toast`), chưa dùng Redux.

## 3. Quy tắc chia file trong `pages/` (BẮT BUỘC)

Mỗi trang là **một thư mục**, bên trong có `index.tsx` là component chính và thư mục `components/` chứa các phần chỉ trang đó dùng:

```
pages/
└── Admin/
    ├── index.tsx              # Trang Admin chính: ghép layout, quản lý state cấp trang
    └── components/            # Các phần CHỈ dùng trong trang Admin
        ├── MemberTable.tsx    # Bảng danh sách thành viên
        ├── MemberFormPopup.tsx# Popup thêm/sửa thành viên
        ├── ConfirmDeletePopup.tsx
        ├── StatsCards.tsx     # Khối thẻ thống kê
        └── AdminTabs.tsx      # Thanh tab chuyển section trong trang
```

Quy luật base:

- **`index.tsx`** chỉ làm 3 việc: gọi data (qua `services/`), giữ state cấp trang (tab đang mở, popup đang mở, item đang chọn), và ghép các component con lại. Không viết UI chi tiết dài trong `index.tsx`.
- **Mỗi phần của trang = 1 file** trong `components/` của trang đó: mỗi section, mỗi popup/modal, mỗi tab content là một file riêng, đặt tên PascalCase mô tả đúng chức năng (`XxxPopup.tsx`, `XxxTable.tsx`, `XxxTab.tsx`).
- **Popup/modal** nhận props `open`, `onClose` (+ data cần thiết); state mở/đóng do `index.tsx` giữ.
- **Tab**: `index.tsx` giữ `activeTab`, mỗi nội dung tab là một component riêng; thanh tab dùng component `Tabs` chung từ `components/ui/`.
- Component **dùng chung từ 2 trang trở lên** → chuyển lên `src/components/` (hoặc `components/ui/` nếu là nguyên tử giao diện). Không copy-paste giữa các trang.
- Logic gọi API viết trong `src/services/`, **không** fetch trực tiếp trong component.
- Types của riêng trang có thể để cùng file component; types dùng chung để ở `src/types/`.

Trang mới (ví dụ `Events`) làm y hệt: `pages/Events/index.tsx` + `pages/Events/components/...`.

## 4. Theme Neumorphism — cách dùng

Toàn bộ token đã khai báo trong `tailwind.config.js`, **không hard-code màu/bóng** trong component.

### Màu

| Class | Giá trị | Dùng cho |
| --- | --- | --- |
| `bg-background` | `#E0E5EC` | Nền trang VÀ nền card/button (cùng một bề mặt — không bao giờ `bg-white`) |
| `text-foreground` | `#3D4852` | Chữ chính |
| `text-muted` | `#6B7280` | Chữ phụ |
| `bg-accent` / `text-accent` | `#6C63FF` | CTA, highlight, focus ring |
| `accent-light` | `#8B84FF` | Gradient, hover |
| `accent-secondary` | `#38B2AC` | Trạng thái thành công |

### Bóng (linh hồn của theme)

| Class | Dùng cho |
| --- | --- |
| `shadow-extruded` | Trạng thái nổi mặc định (card, button) |
| `shadow-extruded-hover` | Hover (kèm `-translate-y-px`) |
| `shadow-extruded-sm` | Element nhỏ |
| `shadow-inset` | Input mặc định, well nông |
| `shadow-inset-deep` | Input focus, hốc icon |
| `shadow-inset-sm` | Trạng thái nhấn (active) của button |

### Component classes có sẵn (trong `src/index.css`)

```html
<button class="neu-btn">Secondary</button>
<button class="neu-btn-primary">Primary</button>
<div class="neu-card neu-card-hover">...</div>
<input class="neu-input" placeholder="..." />
<div class="neu-well h-16 w-16">icon</div>
```

Đã bao gồm sẵn hover lift, active press, focus ring, transition 300ms — cứ dùng, đừng tự viết lại bóng.

### Quy tắc phải nhớ

- **Không border** — bóng định nghĩa mọi cạnh (`border-transparent`).
- **Không nền trắng, không flat button.**
- Bo góc: card `rounded-card` (32px), button/input `rounded-2xl` (16px). Không dùng `rounded-lg` trở xuống.
- Font: heading `font-display` (Plus Jakarta Sans, đã tự áp cho `h1–h6`), body mặc định DM Sans.
- Mọi element tương tác phải có focus ring (`focus-visible:ring-2 ring-accent`) và touch target tối thiểu 44px (`h-12`).
- Mobile-first: breakpoint `md:` (768px), `lg:` (1024px); grid 3 cột → 1 cột trên mobile.

Chi tiết đầy đủ (contrast, animation, anti-patterns): xem `docs/reqcss.md`.

## 5. Quy tắc commit (Conventional Commits)

Format: `<type>(<scope>): <mô tả ngắn>`

| type | Dùng khi |
| --- | --- |
| `feat` | Thêm tính năng mới |
| `fix` | Sửa bug |
| `refactor` | Đổi cấu trúc code, không đổi hành vi |
| `style` | CSS/theme, không đổi logic |
| `docs` | Tài liệu (README, CLAUDE.md...) |
| `chore` | Config, dependencies |
| `perf` / `test` | Tối ưu hiệu năng / test |

- **scope** = tên trang hoặc khu vực, viết thường: `admin`, `layouts`, `theme`, `types`, `config`... (bỏ nếu thay đổi rải rác).
- Mô tả thì hiện tại, không viết hoa chữ đầu, không chấm cuối.

```
feat(admin): them trang tong quan voi mock data
fix(layouts): sua sidebar dinh voi topbar
docs: viet quy tac commit
```

Quy tắc thêm:

- Mỗi commit một việc — không gộp feat + fix + format chung.
- Build pass (`npm run build`) trước khi push.
- Thay đổi lớn: viết body giải thích **lý do** (cách title một dòng trống).
### Quy trình nhánh (bắt buộc)

```
feature/<ten>  ──merge──▶  development  ──PR──▶  main
fix/<ten>      ──merge──▶
```

1. Tạo nhánh từ `development`: `git switch development && git switch -c feature/<ten-tinh-nang>`
2. Commit trên nhánh feature/fix, push nhánh đó lên remote.
3. Merge vào `development` (qua PR hoặc merge local rồi push `development`).
4. Khi `development` ổn định → mở **PR từ `development` → `main`**. KHÔNG bao giờ push/commit thẳng lên `main`.

> **Quy tắc được enforce tự động** bởi hooks trong `.githooks/` (tự kích hoạt sau `npm install` qua script `prepare`):
> - `commit-msg` — chặn commit message sai format, in lỗi cụ thể.
> - `pre-commit` — chặn commit trực tiếp trên `main`.
> - `pre-push` — chặn push trực tiếp lên `main`.
>
> Trên GitHub nên bật thêm Branch protection cho `main` (require PR) để chặn cả người chưa cài hook.
