# 🎬 FilmHub - Website Khám Phá Phim

Website khám phá thế giới điện ảnh được xây dựng với Next.js 14, Tailwind CSS và Zustand. Khám phá hàng ngàn bộ phim, xem trailer, đọc thông tin chi tiết và quản lý danh sách yêu thích của bạn.

## ✨ Tính năng

- 🏠 **Trang chủ**: Hiển thị phim phổ biến, đánh giá cao và sắp ra mắt
- 🎥 **Chi tiết phim**: Thông tin đầy đủ, trailer, diễn viên và phim tương tự
- 🔍 **Tìm kiếm**: Tìm kiếm phim với bộ lọc theo năm, thể loại và sắp xếp
- 💖 **Yêu thích**: Thêm/xóa phim khỏi danh sách yêu thích
- 📱 **Responsive**: Thiết kế thân thiện với mobile
- 🌙 **Dark Mode**: Giao diện tối hiện đại
- ⚡ **Loading States**: Skeleton loading và animations mượt mà

## 🛠️ Công nghệ sử dụng

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS 4.0
- **State Management**: Zustand với persistence
- **API**: The Movie Database (TMDB) hoặc Mock Data
- **HTTP Client**: Axios
- **Images**: Next.js Image Optimization

## 🚀 Cài đặt và chạy

### 1. Clone repository

```bash
git clone <repository-url>
cd film-website
```

### 2. Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
# hoặc
pnpm install
```

### 3. Cấu hình môi trường (Tùy chọn)

```bash
cp .env.example .env.local
```

Thêm TMDB API key vào `.env.local`:

```bash
NEXT_PUBLIC_TMDB_API_KEY=your_api_key_here
```

> **Lưu ý**: Nếu không có API key, website sẽ tự động sử dụng mock data để demo.

### 4. Chạy development server

```bash
npm run dev
# hoặc
yarn dev
# hoặc
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000) để xem website.

## 📁 Cấu trúc thư mục

```
src/app/
├── components/          # Các React components
│   ├── Navbar.tsx      # Navigation bar
│   ├── MovieCard.tsx   # Card hiển thị phim
│   ├── SearchBar.tsx   # Thanh tìm kiếm
│   ├── SearchModal.tsx # Modal tìm kiếm mobile
│   └── FavoriteButton.tsx # Nút yêu thích
├── store/              # Zustand store
│   └── useStore.ts     # State management
├── lib/                # Utilities
│   ├── api.ts          # API functions
│   └── mockData.ts     # Mock data và utils
├── [category]/                # Danh mục
│   └── [slug]          # Mock data và utils
│       └── page.tsx    # trang hiển thị phim theo danh mục
├── movie/[id]/         # Trang chi tiết phim
│   └── page.tsx
├── search/             # Trang tìm kiếm
│   └── page.tsx
├── layout.tsx          # Root layout
├── page.tsx            # Trang chủ
└── globals.css         # Global styles
```

## 🎯 API và Data

### TMDB API

Website hỗ trợ tích hợp với [Ổ Phim API](https://ophim16.cc/). Để sử dụng:

## 🔧 Scripts

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Kiểm tra ESLint
npm run type-check   # Kiểm tra TypeScript
```

## 📱 Responsive Design

Website được thiết kế responsive cho:

- 📱 Mobile: 320px+
- 📱 Tablet: 768px+
- 💻 Desktop: 1024px+
- 🖥️ Large screens: 1280px+

## 🎨 Features chi tiết

### State Management (Zustand)

- ✅ Quản lý danh sách yêu thích
- ✅ Lưu trữ local storage
- ✅ User preferences
- ✅ Search filters và history
- ✅ Dark mode toggle

### UI/UX

- ✅ Dark theme design
- ✅ Smooth animations và transitions
- ✅ Skeleton loading states
- ✅ Hover effects
- ✅ Mobile-first responsive design
- ✅ Image optimization

### Performance

- ✅ Next.js App Router
- ✅ Server-side rendering
- ✅ Image optimization
- ✅ Code splitting
- ✅ Lazy loading

## 🤝 Đóng góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Credits

- **Data**: [Ổ Phim API](https://ophim16.cc/)
- **Icons**: Heroicons, SVG icons
- **Fonts**: Inter (Google Fonts)
- **Framework**: Next.js, React, Tailwind CSS

---

Made with ❤️ by [Your Name]

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
