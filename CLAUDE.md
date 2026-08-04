# CLAUDE.md — IU-Club Frontend

Quy tắc bắt buộc khi code trong dự án này. Đọc kỹ trước khi viết bất kỳ component nào.

## Tech stack

- React 19 + TypeScript + Vite 8
- TailwindCSS 3 (qua PostCSS trong Vite — KHÔNG build CSS thủ công, không có `output.css`)
- Theme: Neumorphism (Soft UI) — spec gốc tại `../docs/reqcss.md`

## Lệnh

```bash
npm run dev      # dev server (http://localhost:5173)
npm run build    # tsc type-check + vite build → dist/
npm run lint     # eslint
```

## Cấu trúc thư mục

```
src/
├── api/          # axios instance, endpoint constants
├── assets/       # ảnh, icon tĩnh
├── components/   # component dùng chung ≥2 trang
│   └── ui/       # nguyên tử theo theme: Button, Card, Input, Modal, Tabs...
├── constants/    # hằng số chung (ROUTES, enums, config)
├── context/      # React Context
├── hooks/        # custom hooks dùng chung
├── layouts/      # MainLayout, AdminLayout (header/sidebar bọc page)
├── pages/        # mỗi trang một thư mục (xem quy tắc dưới)
├── redux/        # store, slices
├── services/     # gọi API theo domain (userService, clubService...)
├── types/        # types/interfaces dùng chung
├── utils/        # hàm thuần (formatDate, validate...)
├── index.css     # Tailwind entry + component classes (neu-*)
├── App.tsx       # root, khai báo routes
└── main.tsx      # entry
```

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

### Màu
- `bg-background` (#E0E5EC) — nền trang VÀ card/button (cùng một bề mặt)
- `text-foreground` (#3D4852) — chữ chính
- `text-muted` (#6B7280) — chữ phụ
- `accent` (#6C63FF) — CTA, focus ring; `accent-light` (#8B84FF) hover/gradient; `accent-secondary` (#38B2AC) success
- `placeholder` (#A0AEC0) — chỉ cho placeholder, KHÔNG dùng cho body text

### Bóng (định nghĩa mọi chiều sâu — không dùng border)
- `shadow-extruded` / `shadow-extruded-hover` / `shadow-extruded-sm` — element nổi
- `shadow-inset` / `shadow-inset-deep` / `shadow-inset-sm` — element lõm (input, icon well, active press)

### Khác
- Bo góc: `rounded-card` (32px) cho card, `rounded-2xl` (16px) cho button/input, `rounded-xl`/`rounded-full` cho phần tử nhỏ
- Font: `font-display` (Plus Jakarta Sans) — đã tự áp cho h1–h6; body mặc định DM Sans
- Animation: `animate-float` cho decor; transition chuẩn `duration-300 ease-out`

### Component classes có sẵn (`src/index.css` — dùng thay vì tự viết lại)
```html
<button class="neu-btn">Secondary</button>
<button class="neu-btn-primary">Primary</button>
<div class="neu-card neu-card-hover">...</div>
<input class="neu-input" />
<div class="neu-well h-16 w-16">icon</div>   <!-- hốc icon lõm sâu -->
<div class="neu-well-sm">...</div>
```
Các class này đã gồm hover lift, active press, focus ring, transition. Cần biến thể mới → thêm vào `@layer components` trong `index.css`, không viết inline một chỗ.

## Anti-patterns (CẤM)

- `bg-white` cho card — card phải cùng màu nền `bg-background`
- Border để tạo cạnh — bóng làm việc đó
- Button flat không bóng
- `rounded-lg` trở xuống — tối thiểu `rounded-2xl`
- Hard-code hex/bóng thay vì dùng token
- Text màu `#A0AEC0`/`#8B95A5` cho nội dung — tối thiểu `text-muted`
- Thiếu focus ring trên element tương tác — bắt buộc `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-background`
- Touch target < 44px — button dùng `h-12` trở lên

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
