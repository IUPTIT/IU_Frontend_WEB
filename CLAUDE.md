# CLAUDE.md — IU-Club Frontend

Quy tắc bắt buộc khi code trong dự án này. Đọc kỹ trước khi viết bất kỳ component nào.

## Tech stack

- React 19 + TypeScript + Vite 8
- TailwindCSS 3 (qua PostCSS trong Vite — KHÔNG build CSS thủ công, không có `output.css`)
- Theme khu quản trị: **IU Club Studio — Airy Card SaaS** (nền lavender sáng, card trắng, bóng mềm, nhấn tím `#7C3AED` + gradient thương hiệu tím→magenta). Đã gỡ Neumorphism/Soft UI. Trang marketing (Landing/Lookup/Recruitment) dùng theme dark riêng ở `src/styles/landing.css`.

## Lệnh

```bash
npm run dev      # dev server (http://localhost:5173)
npm run build    # tsc -b (type-check) + vite build → dist/  — phải pass trước khi push
npm run lint     # eslint
npm start        # vite preview (build production)
```

Chưa có test runner. `playwright` đã cài trong devDependencies nhưng KHÔNG có script test hay suite nào — đừng giả định `npm test` chạy được. Cổng cấu hình qua `.env` (`VITE_API_URL`, `DEV_PORT`, `WEB_PORT`) — copy từ `.env.example`.

## Cấu trúc thư mục

```
src/
├── api/          # client.ts: fetch wrapper dùng chung (KHÔNG phải axios)
├── assets/       # ảnh, icon tĩnh
├── components/   # component dùng chung ≥2 trang
│   └── ui/       # nguyên tử theo theme: Button, Card, Input, Modal, Tabs...
├── constants/    # hằng số chung (ROUTES, enums, config)
├── context/      # React Context
├── hooks/        # custom hooks dùng chung
├── layouts/      # MainLayout, AdminLayout (header/sidebar bọc page)
├── pages/        # mỗi trang một thư mục (xem quy tắc dưới)
├── redux/        # placeholder rỗng (chỉ README) — state hiện dùng Context, chưa cài Redux
├── services/     # gọi API theo domain (userService, clubService...)
├── types/        # types/interfaces dùng chung
├── utils/        # hàm thuần (formatDate, validate...)
├── index.css     # Tailwind entry + component classes (ui-*)
├── App.tsx       # root, khai báo routes
└── main.tsx      # entry
```

## Kiến trúc runtime (BẮT BUỘC đọc — không suy ra được từ đọc lướt)

### Điều hướng portal — KHÔNG dùng route lồng của React Router
`App.tsx` chỉ khai báo vài route công khai (`/`, `/tuyen-thanh-vien`, `/tra-cuu`, `/login`, `/reset-password`) và **4 route wildcard** `/admin/*` · `/leader/*` · `/member/*` · `/candidate/*` — cả 4 đều render CÙNG một `AdminPortal`. Trang con thật do `renderPortalPage(path)` trong `src/routes/portalRoutes.tsx` quyết định: tra `PAGE_MAP[path]` (map path → component), riêng trang chi tiết (application/department/slot/note/task) match bằng regex để rút id. **URL là nguồn điều hướng duy nhất** — không giữ activePage trong state.

Thêm một trang mới = 3 bước, thiếu bước nào trang cũng không hiện:
1. Khai path trong `src/constants/routes.ts` (`ROUTES`).
2. Thêm mục vào `src/constants/navigation.ts` (`SIDEBAR_CONFIG`) để hiện trên sidebar.
3. Map path → component trong `PAGE_MAP` (hoặc thêm regex nếu là trang chi tiết có id).

`getDefaultPath(role)` và `findNavIdByPath(role, path)` (trong `navigation.ts`) lo trang mặc định + highlight sidebar theo prefix dài nhất.

### Xác thực & phân quyền (`src/api/client.ts` + `src/context/AuthContext.tsx` + `src/services/authService.ts`)
- Mọi API đi qua object `api` trong `client.ts` — fetch wrapper tự gắn `Bearer` access token, backend trả envelope `{ success, message, data }`, wrapper bóc sẵn `data`. Lỗi ném `ApiRequestError` kèm `status`.
- Access token giữ trong `sessionStorage`; refresh token là **cookie httpOnly** (`credentials: "include"`). Gặp 401 (trừ path `/auth/*`) → tự gọi `/auth/refresh` **đúng 1 lần** rồi retry.
- `AuthContext` là nguồn user duy nhất, persist ở `sessionStorage`; mở lại tab thì `restoreSession()` xác thực lại.
- Backend dùng role `bcn` cho Ban Chủ nhiệm — frontend map thành `admin` (`mapRole` trong `authService.ts`). Roles là **cộng dồn** (`roles[]`, VD dual `["member","leader"]`); cờ phụ: `isMentor`, `memberStatus`, `requirePasswordChange`.
- Guard trong `AdminPortal` (`App.tsx`): chưa auth → `/login`; `requirePasswordChange` → `ChangePasswordGate`; sai prefix portal → về `getDefaultPath`; path mentor-only mà `isMentor !== true` → chặn deep-link.

### Tầng service — component KHÔNG tự fetch
Mỗi domain một file trong `src/services/` (auth, members, recruitment, training, departments, dashboard, email, permissions, notification, candidate, publicRecruitment). Quy ước: khai `BackendXxx` DTO nội bộ, viết `toXxx()` map sang type frontend ở `src/types/` (gồm cả `bcn`→`admin`), rồi gọi qua `api`. Trang lấy data qua service, giữ state cấp trang ở `index.tsx`.

### State toàn cục = React Context (không Redux)
`AuthContext` (user/đăng nhập), `PortalUiContext` (UI shell), `PreferencesContext`, `ToastContext`. Mỗi context tách file provider `XxxContext.tsx` + hook `useXxx.ts`. `src/redux/` chỉ là placeholder cho tương lai — đừng import.

## Quy tắc chia file trong `pages/` (BẮT BUỘC)

Mỗi trang = một thư mục PascalCase, có `index.tsx` + `components/` riêng:

```
pages/Admin/
├── index.tsx              # ghép component, giữ state cấp trang
└── components/
    ├── MemberTable.tsx
    ├── MemberFormPopup.tsx
    ├── ConfirmDeletePopup.tsx
    ├── StatsCards.tsx
    └── AdminTabs.tsx
```

- `index.tsx` chỉ làm 3 việc: gọi data qua `services/`, giữ state cấp trang (activeTab, popup đang mở, item đang chọn), ghép component con. KHÔNG viết UI chi tiết dài trong `index.tsx`.
- Mỗi section / popup / tab-content = 1 file riêng trong `components/` của trang, tên PascalCase mô tả chức năng (`XxxPopup.tsx`, `XxxTable.tsx`, `XxxTab.tsx`).
- Popup/modal nhận props `open`, `onClose` (+ data); state mở/đóng do `index.tsx` giữ.
- Component dùng ở ≥2 trang → chuyển lên `src/components/` (nguyên tử UI thì vào `components/ui/`). Không copy-paste giữa các trang.
- KHÔNG fetch API trực tiếp trong component — viết trong `src/services/`.
- Types riêng của trang để cùng file; types dùng chung để ở `src/types/`.

## Biến chung (design tokens) — cách dùng

Mọi token khai báo trong `tailwind.config.js`. KHÔNG hard-code hex màu, bóng, hay font trong component — luôn dùng class:

### Màu — nền trang (canvas) TÁCH khỏi bề mặt (surface)
- `bg-canvas` (#F4F4FB) — nền trang (page background, nền lavender airy)
- `bg-background` / `bg-surface` (#FFFFFF) — card / topbar / sidebar / modal (bề mặt trắng, khác canvas)
- `bg-surface-2` (#F5F6FB) — chip, header bảng, hover nhẹ
- `border-line` (#EBEBF3) / `border-line-strong` (#E2E3EF) — hairline / divider
- `text-foreground` (#191A2C) — chữ chính
- `text-muted` (#6B7086) — chữ phụ; `text-faint` (#9AA0B4) — caption/chữ mờ
- `accent` (#7C3AED) — CTA, focus ring; `accent-light` (#8B84FF); `accent-secondary` (#38B2AC) success
- `brand-from` (#6E2CE6) → `brand-to` (#E0348C) — gradient thương hiệu (nút primary); có sẵn `bg-brand-gradient`
- `placeholder` (#A0AEC0) — chỉ cho placeholder, KHÔNG dùng cho body text

### Bóng (airy, một chiều — hairline thay cho lõm)
- `shadow-soft` / `shadow-soft-sm` / `shadow-soft-lg` — element nổi (card, button)
- `shadow-hairline` — viền mảnh 1px (input, icon well); hoặc dùng `border border-line`

### Khác
- Bo góc: `rounded-card` (16px) cho card, `rounded-xl` (12px) cho button/input, `rounded-full` cho phần tử tròn
- Font: `font-display` (Plus Jakarta Sans) — đã tự áp cho h1–h6; body mặc định DM Sans. Khu `.portal-shell` dùng Inter (body) + Space Grotesk (heading)
- Animation: `animate-float` cho decor; transition chuẩn `duration-200 ease-out`; reveal khi vào trang portal dùng `.portal-rise`

### Component classes có sẵn (`src/index.css` — dùng thay vì tự viết lại)
```html
<button class="ui-btn">Secondary</button>
<button class="ui-btn-primary">Primary</button>   <!-- nền gradient thương hiệu -->
<div class="ui-card ui-card-hover">...</div>
<input class="ui-input" />
<div class="ui-well h-16 w-16">icon</div>   <!-- chip icon nền surface-2 + hairline -->
<div class="ui-well-sm">...</div>
```
Các class này đã gồm hover lift, active press, focus ring, transition. Cần biến thể mới → thêm vào `@layer components` trong `index.css`, không viết inline một chỗ.

## Anti-patterns (CẤM)

- Dùng `bg-canvas` cho card, hoặc `bg-surface`/`bg-background` cho nền trang — card (surface trắng) phải TÁCH khỏi nền trang (canvas lavender)
- Card phẳng không bóng — dùng `ui-card`/`shadow-soft`
- Bóng đôi kiểu neumorphism (`extruded`/`inset` lồi-lõm) — đã gỡ, không tái tạo
- `rounded-md` trở xuống cho card/button — card `rounded-card` (16px), button/input tối thiểu `rounded-xl`
- Hard-code hex/bóng thay vì dùng token (đặc biệt tím cũ `#6C63FF` — dùng `accent` #7C3AED)
- Text màu `#A0AEC0`/`#9AA0B4` cho nội dung — tối thiểu `text-muted`
- Thiếu focus ring trên element tương tác — bắt buộc `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-canvas`
- Touch target < 44px — button dùng `h-12` trở lên

> Border hairline (`border border-line`) giờ ĐƯỢC phép để tách bề mặt — khác thời Neumorphism (khi đó cấm border).

## Quy tắc commit (Conventional Commits)

Format: `<type>(<scope>): <mô tả ngắn>`

- **type**: `feat` (tính năng mới) · `fix` (sửa bug) · `refactor` (đổi cấu trúc, không đổi hành vi) · `style` (CSS/theme, không đổi logic) · `docs` (README, CLAUDE.md...) · `chore` (config, dependencies) · `perf` · `test`
- **scope**: tên trang hoặc khu vực, viết thường: `admin`, `layouts`, `theme`, `types`, `config`... Bỏ scope nếu thay đổi rải rác.
- **Mô tả**: tiếng Việt không dấu hoặc tiếng Anh, thì hiện tại, không viết hoa chữ đầu, không chấm cuối.

Ví dụ:

```
feat(admin): them trang tong quan voi mock data
fix(layouts): sua sidebar dinh voi topbar
style(theme): doi shadow inset cho input focus
refactor(types): chuyen types admin ve src/types
docs: viet quy tac commit
chore(config): them postcss + autoprefixer
```

Quy tắc thêm:

- Mỗi commit một việc — không gộp feat + fix + format vào một commit.
- Commit phải build pass (`npm run build`) trước khi push.
- Thay đổi lớn thì viết thêm body (cách title một dòng trống) giải thích **lý do**, không tả lại diff.
- Nhánh — flow bắt buộc: `feature/<ten>` hoặc `fix/<ten>` → merge vào `development` → PR từ `development` vào `main`. CẤM commit/push trực tiếp lên `main` (hooks `pre-commit`/`pre-push` trong `.githooks/` sẽ chặn). Tạo nhánh mới luôn xuất phát từ `development`.

## Responsive

Mobile-first. Breakpoints: `md:` (768px), `lg:` (1024px). Grid 3 cột → 1 cột mobile; `text-7xl` → `text-5xl` mobile; padding card `p-16` → `p-8` mobile.
