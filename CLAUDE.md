# FoodiePlan

A meal planning web app built with Next.js App Router, MongoDB, Google OAuth, and Gemini AI. Deployed on Vercel.

## Architecture

Single Next.js application (no monorepo). Server Components fetch data directly from MongoDB; Client Components handle interactivity and call API routes for mutations.

```
app/                          # Next.js App Router pages
  layout.tsx                  # Root layout (SessionProvider, ThemeProvider, Navigation)
  page.tsx                    # Home page
  plan/page.tsx               # Meal plan page
  cart/page.tsx               # Shopping cart page
  settings/page.tsx           # Settings page
  (auth)/login/page.tsx       # Login page
  api/
    auth/[...nextauth]/       # Auth.js route handler
    recipes/, meals/,         # CRUD REST endpoints
    ingredients/
    ai/suggest/, ai/generate-plan/  # Gemini AI endpoints
components/
  ui/                         # shadcn/ui components (Radix UI + Tailwind)
  figma/                      # Figma-exported helper components
  navigation.tsx              # App navigation (Next.js Link + usePathname)
  {home,plan,cart,settings}/  # Feature-specific client components
lib/
  db/connection.ts            # Mongoose connection (global cache for serverless)
  db/models/                  # Mongoose models (user, recipe, ingredient, meal-plan, shopping-list)
  auth/auth.ts                # Auth.js v5 config (Google OAuth + MongoDB adapter)
  auth/auth.config.ts         # Edge-safe auth config (for middleware)
  gemini/client.ts            # Gemini API wrapper
  gemini/prompts.ts           # Prompt templates
  types/index.ts              # Shared TypeScript interfaces
  utils.ts                    # cn() utility (clsx + tailwind-merge)
middleware.ts                 # Auth.js route protection
```

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm test         # Run Vitest in watch mode
pnpm test:run     # Run Vitest once (CI)
```

## TDD Workflow

1. Write a failing test in `__tests__/`
2. Run `pnpm test` (watch mode) — see it fail (red)
3. Write minimal code to pass the test (green)
4. Refactor while tests stay green

Run a single test file: `pnpm vitest run __tests__/path/to/file.test.ts`

## Code Conventions

- **File naming**: kebab-case for all files (`meal-plan.ts`, `home-page-content.tsx`)
- **Server Components**: `app/**/page.tsx` files — fetch data directly, no `"use client"`
- **Client Components**: `components/**/*.tsx` — start with `"use client"`, receive data as props
- **Import paths**: Always use `@/` alias (`@/components/ui/button`, `@/lib/db/connection`)
- **API routes**: Check `auth()` session first, return 401 if unauthenticated
- **Models**: Use `mongoose.models.X || mongoose.model()` pattern (prevents re-registration in dev)
- **CSS**: Tailwind CSS v4 with `@tailwindcss/postcss` plugin, theme vars in `app/globals.css`

## Key Integrations

- **MongoDB**: Mongoose ODM, connection cached globally for serverless (`lib/db/connection.ts`)
- **Auth**: Auth.js v5 (next-auth@beta) with Google OAuth provider and MongoDB adapter
- **AI**: Google Gemini 2.0 Flash via `@google/generative-ai` SDK
- **UI**: shadcn/ui components (Radix UI + Tailwind + CVA)
- **Theming**: next-themes for dark/light mode

## Environment Variables

```
MONGODB_URI=              # MongoDB connection string
AUTH_SECRET=              # Auth.js secret (generate: openssl rand -base64 32)
AUTH_GOOGLE_ID=           # Google OAuth client ID
AUTH_GOOGLE_SECRET=       # Google OAuth client secret
ENCRYPTION_KEY=           # 64-char hex string for API key encryption (generate: openssl rand -hex 32)
NEXT_PUBLIC_APP_URL=      # App URL (http://localhost:3000 in dev)
```
