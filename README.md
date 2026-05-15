# CodeZeen Web

A modern, multilingual portfolio and agency website built with Next.js 16, Sanity CMS, and advanced animations.

## 🚀 Features

- **Next.js 16** with App Router and Server Components
- **Multilingual Support** (Arabic & English) using next-intl
- **Sanity CMS** for content management with live preview
- **Advanced Animations** using GSAP and Framer Motion
- **Responsive Design** with Tailwind CSS 4
- **Contact Form** with email integration (Resend)
- **SEO Optimized** with metadata and sitemap generation
- **Type-Safe** with TypeScript

## 📋 Prerequisites

- Node.js 20+ 
- npm or yarn
- Sanity account (for CMS)
- Resend account (for email functionality)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd codezeen-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
   
   Then update the values in `.env.local`:
   - `NEXT_PUBLIC_SANITY_PROJECT_ID`: Your Sanity project ID
   - `SANITY_API_TOKEN`: Your Sanity API token (with write permissions)
   - `RESEND_API_KEY`: Your Resend API key for email
   - `SANITY_REVALIDATE_SECRET`: A secret string for webhook revalidation
   - `NEXT_PUBLIC_SITE_URL`: Your site URL (production URL when deploying)

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎨 Sanity Studio

To access the Sanity Studio for content management:

1. Navigate to `/studio` in your browser (e.g., `http://localhost:3000/studio`)
2. Sign in with your Sanity account
3. Start creating and managing content

## 📁 Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── [locale]/          # Localized routes (ar, en)
│   ├── api/               # API routes
│   └── studio/            # Sanity Studio
├── components/            # React components
│   ├── animations/        # Animation components (GSAP, Motion)
│   ├── layout/            # Layout components (Header, Footer)
│   ├── sections/          # Page sections
│   └── ui/                # UI components
├── sanity/                # Sanity CMS configuration
│   ├── lib/               # Sanity client and utilities
│   └── schemaTypes/       # Content schemas
├── messages/              # i18n translation files
├── lib/                   # Utility functions
└── public/                # Static assets
```

## 🌐 Internationalization

The site supports Arabic and English. Translation files are located in:
- `messages/ar.json` (Arabic)
- `messages/en.json` (English)

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set all environment variables from `.env.example` in your deployment platform, and update `NEXT_PUBLIC_SITE_URL` to your production URL.

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Configuration

- **Next.js Config**: `next.config.ts`
- **TypeScript Config**: `tsconfig.json`
- **Tailwind Config**: `postcss.config.mjs`
- **ESLint Config**: `eslint.config.mjs`
- **Sanity Config**: `sanity.config.ts`

## 📚 Documentation

For more detailed information, check out:
- [PAGES.md](./PAGES.md) - Page structure and routing
- [ANIMATIONS.md](./ANIMATIONS.md) - Animation components guide
- [BUILD_ORDER.md](./BUILD_ORDER.md) - Development phases
- [QUALITY.md](./QUALITY.md) - Code quality standards

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.

## 🆘 Support

For issues and questions, please open an issue in the GitHub repository.
