# MyDynamics V2 — מערכת ניהול פרויקטים מאוחדת

## Scope
מערכת MyDynamics V2 המאוחדת של אשת דיינמיקס (אלום עשת אומן בע"מ).
כל המודולים נמצאים כאן כ-route groups.
מחליפה 10 אפליקציות נפרדות במערכת אחת מאובטחת.

## Stack
- **Framework:** Next.js 16.2.6 (Turbopack), React 19, TypeScript
- **Auth:** Auth.js v5 (next-auth 5.0.0-beta.32), JWT strategy, CredentialsProvider
- **DB:** Prisma 7.10 + @prisma/adapter-pg (PrismaPg) → Neon PostgreSQL
- **Styling:** Tailwind CSS 4, PostCSS, design system in globals.css
- **Validation:** zod 3.25
- **Icons:** lucide-react (אין Crane — להשתמש ב-Construction)
- **Real-time:** SSE via /api/events

## Architecture
```
src/
├── app/
│   ├── (auth)/login/          ← דף login ציבורי (page.tsx + LoginForm.tsx)
│   ├── (shell)/               ← layout מאומת עם sidebar + topbar
│   │   ├── dashboard/         ← דף בית עם 7 כרטיסי מודולים
│   │   ├── schedule/          ← לוח זמנים
│   │   ├── equipment/         ← ציוד הרמה
│   │   ├── buyout/            ← תמכור
│   │   ├── meetings/          ← סיכום ישיבות
│   │   ├── drawings/          ← שרטוטים
│   │   ├── procurement/       ← חיפוש רכש
│   │   ├── supply-chain/      ← שרשרת הספקה
│   │   └── admin/             ← ניהול משתמשים (ADMIN בלבד)
│   └── api/
│       ├── auth/[...nextauth]/ ← Auth.js route handlers
│       ├── admin/users/        ← CRUD משתמשים
│       └── events/             ← SSE endpoint
├── components/shell/           ← Sidebar, TopBar
└── lib/
    ├── auth.ts                 ← Auth.js config
    ├── rbac.ts                 ← permission checks (can, assertCan)
    ├── db.ts                   ← PrismaClient singleton with PrismaPg adapter
    ├── api-utils.ts            ← protectedRoute() helper
    ├── rate-limit.ts           ← in-memory rate limiter
    └── realtime.ts             ← SSE broadcast
```

## Database — Neon PostgreSQL
- **Project:** mydynamics-v2 (Neon console)
- **Project ID:** round-sunset-71539168
- **Region:** AWS US East 2 (Ohio)
- **Branch:** production
- **Host:** ep-wispy-glitter-b4ho3xrn.c-6.us-east-2.aws.neon.tech
- **Database:** neondb
- **User:** neondb_owner
- **Prisma 7 חשוב:** אין url בסכמה — ה-URL מוגדר ב-prisma.config.ts (datasource.url)
- **Adapter:** PrismaPg נדרש ב-constructor של PrismaClient (כולל seed.ts)

## Security
- Auth.js v5 with JWT strategy (CredentialsProvider)
- RBAC: ADMIN > MANAGER > SITE_MANAGER > WORKER > VIEWER
- Middleware (src/middleware.ts) — בודק JWT cookie, לא מייבא auth/prisma (Edge runtime)
- zod validation על כל API inputs
- Rate limiting על mutation endpoints (in-memory, צריך upstash לproduction)
- Security headers ב-next.config.ts (X-Frame-Options, HSTS, nosniff, Permissions-Policy)
- סיסמאות: bcryptjs 2.4.3, salt rounds 12

## RBAC Permissions
| פעולה | ADMIN | MANAGER | SITE_MANAGER | WORKER | VIEWER |
|-------|-------|---------|--------------|--------|--------|
| manage_users | V | | | | |
| crud_all | V | V | | | |
| edit_tasks | V | V | V | | |
| view | V | V | V | V | V |
| order_equipment | V | V | V | V | |
| edit_quotes | V | V | | | |

## Real-Time
- SSE via /api/events עם keepalive כל 15 שניות, timeout 4.5 דקות
- broadcast() ב-lib/realtime.ts לשליחת events מה-server

## Conventions
- כל model עם `version Int @default(1)` — optimistic locking
- כל mutation: zod validation → RBAC check → rate limit → execute
- להשתמש ב-`protectedRoute()` מ-lib/api-utils.ts לAPI routes
- Next.js 16: useSearchParams() דורש Suspense boundary
- Next.js 16: middleware deprecated, יש warning על proxy

## ENV Variables (.env)
- `DATABASE_URL` — Neon PostgreSQL connection string (עם sslmode=require)
- `AUTH_SECRET` — Auth.js secret (random base64)
- `AUTH_URL` — URL של האפליקציה (localhost:3000 local, vercel URL בproduction)
- `ADMIN_SEED_PASSWORD` — סיסמת admin ראשוני (seed בלבד)

## Admin User
- **Email:** admin@eshetdynamics.co.il
- **Role:** ADMIN
- **Seed:** `npm run db:seed` (דורש ADMIN_SEED_PASSWORD ב-.env)

## Commands
```bash
npm run dev          # שרת פיתוח (port 3000)
npm run build        # build (כולל prisma generate)
npm run start        # production server
npm run db:push      # sync schema → Neon
npm run db:studio    # Prisma Studio (GUI לDB)
npm run db:seed      # seed admin user
npx prisma generate  # generate Prisma client
```

## Deploy — Vercel
```bash
vercel --yes                    # preview deploy
vercel env add DATABASE_URL     # הגדרת connection string
vercel env add AUTH_SECRET      # הגדרת secret
vercel env add AUTH_URL          # URL של האפליקציה
vercel --prod                   # production deploy
```

## Known Issues / Notes
- lucide-react: אין אייקון Crane, להשתמש ב-Construction
- Prisma 7: לא תומך ב-url בתוך schema.prisma — חייב prisma.config.ts
- Prisma 7: PrismaClient דורש adapter בconstructor
- Rate limiter: in-memory, לא עובד cross-function ב-Vercel — צריך @upstash/ratelimit
- middleware.ts: לא מייבא auth.ts/prisma (Edge runtime) — בודק cookie ישירות
- next-auth: גרסת beta בלבד (5.0.0-beta.32) — אין stable release

## Blueprint Sources (מהאפליקציות הישנות)
- `terminal3-scheduler/` — Gantt chart, Task model, schedule logic
- `במות מנופים/` — Equipment models, sidebar design, globals.css
- `תמכור הצעות מחיר/` — Buyout models
- `קוראה-SD/` — Sidebar with lucide-react

## Phase Plan
1. **[DONE]** תשתית — Auth, RBAC, shell, schema, security
2. **[NEXT]** מודול לוח זמנים — port terminal3-scheduler
3. ציוד + תמכור — port equipment-advisor + buyout-tool
4. מודולים נוספים + SSE real-time
5. Polish + cutover
