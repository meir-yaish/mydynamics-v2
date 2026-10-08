# MY-Dynamics V2 — רשימת דרישות מלאה

> מקור אמת אחד. נבנה מ-19 מסמכי פרויקט, 6 commits, ו-19+ שיחות Claude Code.
> תאריך: 2026-10-05

## מקרא סטטוס

| סטטוס | משמעות |
|--------|--------|
| ✅ עובד | קיים ועובד בגרסה הנוכחית |
| 🔶 חלקי | קיים חלקית — חסר פונקציונליות או לא נבדק |
| ❌ חסר | לא קיים בגרסה הנוכחית |
| ⚠️ סתירה | סותר דרישה אחרת — צריך הכרעה |

---

## 1. אימות והתחברות (Auth)

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| AUTH-01 | כניסה אחידה לכל המערכת — email + סיסמה | CLAUDE.md, שיחה 7cf7fe1e | ✅ עובד |
| AUTH-02 | שם משתמש = כתובת מייל, סיסמה = מספר טלפון | שיחה 7cf7fe1e שורות 3481, 4285 | ✅ עובד |
| AUTH-03 | Auth.js v5 (next-auth 5.0.0-beta.32), JWT strategy, CredentialsProvider | mydynamics-v2/CLAUDE.md | ✅ עובד |
| AUTH-04 | JWT מכיל userId, role, name. תוקף session = 30 דקות | src/lib/auth.ts, שיחה שורה 5337 | ✅ עובד |
| AUTH-05 | Cookie בשם `md.session`, httpOnly, sameSite lax, secure בprod | src/lib/auth.ts, commit aa23bb3 | ✅ עובד |
| AUTH-06 | סגירת דפדפן = התנתקות (session-scoped cookie, לא persistent) | שיחה 7cf7fe1e שורה 5337 | ✅ עובד |
| AUTH-07 | Middleware בודק cookie בלבד (לא מייבא auth/prisma — Edge runtime) | mydynamics-v2/CLAUDE.md, commit d706116 | ✅ עובד |
| AUTH-08 | Rate limit על login: 5 ניסיונות למייל ל-60 שניות | src/lib/auth.ts | ✅ עובד |
| AUTH-09 | Redirect ל-`/login?callbackUrl=` כשלא מאומת | src/middleware.ts | ✅ עובד |
| AUTH-10 | דפי ציבור: `/login`, `/api/auth/*`, `/_next/*`, `/favicon*` | src/middleware.ts | ✅ עובד |
| AUTH-11 | Admin seed: meir@eshetdynamics.co.il, ADMIN, `npm run db:seed` | prisma/seed.ts | ✅ עובד |
| AUTH-12 | משתמשים: דמיטרי, אינגה, אביחי (MANAGER) — נוספו ידנית | שיחה 7cf7fe1e | ✅ עובד |
| AUTH-13 | הצפנת סיסמאות: bcryptjs 2.4.3, salt rounds 12 | mydynamics-v2/CLAUDE.md | ✅ עובד |

---

## 2. הרשאות (RBAC)

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| RBAC-01 | 5 תפקידים בהיררכיה: ADMIN > MANAGER > SITE_MANAGER > WORKER > VIEWER | mydynamics-v2/CLAUDE.md, CLAUDE.md שורש | ✅ עובד |
| RBAC-02 | manage_users = ADMIN בלבד | src/lib/rbac.ts | ✅ עובד |
| RBAC-03 | crud_all = ADMIN, MANAGER | src/lib/rbac.ts | ✅ עובד |
| RBAC-04 | edit_tasks = ADMIN, MANAGER, SITE_MANAGER | src/lib/rbac.ts | ✅ עובד |
| RBAC-05 | view = כל התפקידים | src/lib/rbac.ts | ✅ עובד |
| RBAC-06 | order_equipment = כולם חוץ מ-VIEWER | src/lib/rbac.ts | ✅ עובד |
| RBAC-07 | edit_quotes = ADMIN, MANAGER | src/lib/rbac.ts | ✅ עובד |
| RBAC-08 | אכיפת הרשאות גם ב-Backend, לא רק הסתרת כפתורים | CLAUDE.md שורש, תוכנית מאסטר | ✅ עובד (ב-protectedRoute) |
| RBAC-09 | הצגת שם תפקיד בעברית: מנהל/מנהל פרויקט/מנהל אתר/עובד/צופה | src/components/shell/Sidebar.tsx | ✅ עובד |
| RBAC-10 | ⚠️ דפי תקציב/P&L נגישים רק לדין, מאיר, אבי — עם קוד גישה | שיחה 9e6e7d0a שורות 6863, 8737 | ⚠️ סתירה |

**סתירה RBAC-10:** מערכת ה-RBAC הנוכחית מבוססת על 5 תפקידים כלליים. הדרישה לגישה לפי שם משתמש ספציפי (דין, מאיר, אבי) + קוד גישה נפרד — לא מתאימה למודל הקיים. **מה נכון?** האם לבנות הרשאה מיוחדת ברמת משתמש עבור דפי כספים, או שמספיק RBAC רגיל (ADMIN/MANAGER)?

---

## 3. תשתית ואבטחה (Infrastructure & Security)

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| INFRA-01 | מקור נתונים מרכזי אחד — Neon PostgreSQL | CLAUDE.md שורש, mydynamics-v2/CLAUDE.md | ✅ עובד |
| INFRA-02 | Prisma 7.10 + PrismaPg adapter, URL ב-prisma.config.ts | mydynamics-v2/CLAUDE.md | ✅ עובד |
| INFRA-03 | כל model עם `version Int @default(1)` — optimistic locking | CLAUDE.md שורש, prisma/schema.prisma | 🔶 חלקי — שדה קיים, לוגיקת conflict detection לא ממומשת |
| INFRA-04 | שדות `createdBy`, `updatedBy` בכל model | תוכנית מאסטר | 🔶 חלקי — קיים ב-Project/Task, חסר בחלק מה-models |
| INFRA-05 | SSE via /api/events, keepalive 15 שניות, timeout 4.5 דקות | mydynamics-v2/CLAUDE.md, src/lib/realtime.ts | ✅ עובד (תשתית) |
| INFRA-06 | broadcast() עם סינון לפי userId ו-roles | src/lib/realtime.ts, commit 488e204 | ✅ עובד |
| INFRA-07 | כל mutation שולח event דרך broadcast | תוכנית מאסטר | ❌ חסר — אין mutations עדיין חוץ מ-admin |
| INFRA-08 | Rate limiting על mutations — 60 req/min per IP | src/lib/rate-limit.ts | ✅ עובד (in-memory) |
| INFRA-09 | Rate limiter צריך @upstash/ratelimit לproduction | mydynamics-v2/CLAUDE.md | ❌ חסר — עדיין in-memory |
| INFRA-10 | Zod validation על כל API input | mydynamics-v2/CLAUDE.md | ✅ עובד (ב-admin/users) |
| INFRA-11 | Security headers: X-Frame-Options, HSTS, nosniff, CSP, Permissions-Policy | next.config.ts, commit 488e204 | ✅ עובד |
| INFRA-12 | Server body size limit: 2MB | next.config.ts | ✅ עובד |
| INFRA-13 | protectedRoute() helper לכל API route | src/lib/api-utils.ts | ✅ עובד |
| INFRA-14 | 401 ללא JWT, 403 ללא הרשאה | src/lib/api-utils.ts, תוכנית מאסטר | ✅ עובד |
| INFRA-15 | Conflict dialog: "הרשומה עודכנה ע"י [משתמש]. לטעון מחדש?" | CLAUDE.md שורש, תוכנית מאסטר | ❌ חסר — UI לא ממומש |
| INFRA-16 | Deploy ב-Vercel, כתובת קבועה: mydynamics-v2.vercel.app | mydynamics-v2/CLAUDE.md, שיחה | ✅ עובד |
| INFRA-17 | לא ליצור פרויקט Vercel חדש ולא לשנות כתובת | שיחה 7cf7fe1e | ✅ (כלל עבודה) |

---

## 4. ממשק משתמש (UI Shell)

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| UI-01 | RTL, עברית, direction: rtl | src/app/globals.css, layout.tsx | ✅ עובד |
| UI-02 | Sidebar ימני קבוע, 250px | src/app/globals.css, Sidebar.tsx | ✅ עובד |
| UI-03 | לוגו MY-Dynamics (עם מקף) ברקע כהה #171b32 | Sidebar.tsx, login/page.tsx, commit f8ce3e8 | ✅ עובד |
| UI-04 | TopBar גובה 56px | src/app/globals.css | ✅ עובד |
| UI-05 | Mobile: sidebar מוסתר ב-max-width 768px | src/app/globals.css | ✅ עובד |
| UI-06 | Print mode: הסתרת nav, topbar, כפתורים | src/app/globals.css | ✅ עובד |
| UI-07 | Design system: CSS variables לצבעים, .card, .btn, .badge, .fade-in | src/app/globals.css | ✅ עובד |
| UI-08 | Icons: lucide-react (Construction במקום Crane) | mydynamics-v2/CLAUDE.md | ✅ עובד |
| UI-09 | שם חברה למשתמשים: "עשת דינמיקס" (לא "אלום עשת") | memory user_company_name.md | 🔶 חלקי — layout.tsx כותב "אלום עשת" |
| UI-10 | Error boundary, 404 page, loading spinner | commit 488e204 | ✅ עובד |

---

## 5. דשבורד (Dashboard)

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| DASH-01 | דף הבית `/dashboard` — אחרי login | mydynamics-v2/CLAUDE.md | ✅ עובד |
| DASH-02 | ברכת "שלום, {name}" + כרטיסי מודולים | src/app/(shell)/dashboard/page.tsx | ✅ עובד |
| DASH-03 | 7+ כרטיסי מודולים עם SVG אילוסטרציות | commit 488e204 | ✅ עובד |

---

## 6. לוח זמנים (Schedule Module) — `/schedule`

### 6א. תשתית

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-01 | מודול `/schedule` — מיזוג terminal3-scheduler + schedule-studio | תוכנית מאסטר, VARIATIONS.md | ❌ חסר — placeholder בלבד |
| SCHED-02 | API routes לTasks, Projects, Baselines, Milestones, Procurement | APPS.md, terminal3-scheduler/CLAUDE.md | ❌ חסר |
| SCHED-03 | תמיכה בריבוי פרויקטים (multi-project) | schedule-studio/CLAUDE.md | ❌ חסר |
| SCHED-04 | תמונת פרויקט מייצגת בכניסה ללו"ז | שיחה 7cf7fe1e שורה 4622 | ❌ חסר |

### 6ב. גאנט (Gantt Chart)

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-10 | תצוגת גאנט SVG עם header 3 שכבות (שנה/חודש/שבוע) | terminal3-scheduler GanttChart.tsx | ❌ חסר |
| SCHED-11 | פסים צבעוניים לפי phase, חצי תלויות, critical path | terminal3-scheduler, schedule-studio | ❌ חסר |
| SCHED-12 | Baseline overlay — השוואת מצב נוכחי מול baseline | terminal3-scheduler GanttChart.tsx | ❌ חסר |
| SCHED-13 | רצועות חגים (Israel + Portugal calendar) | terminal3-scheduler lib/calendar.ts | ❌ חסר |
| SCHED-14 | Facade view panel — תמונות בניין עם אזורים מסומנים | terminal3-scheduler FacadeView.tsx | ❌ חסר |
| SCHED-15 | Procurement panel — פריטי רכש לכל משימה | terminal3-scheduler ProcurementPanel.tsx | ❌ חסר |
| SCHED-16 | תמונות מותאמות למשימות (customImage) | terminal3-scheduler GanttChart.tsx | ❌ חסר |

### 6ג. טבלת משימות

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-20 | טבלת משימות HTML מקובצת לפי phase | schedule-studio TaskTable.tsx | ❌ חסר |
| SCHED-21 | עריכה inline בטבלה | schedule-studio TaskTable.tsx | ❌ חסר |
| SCHED-22 | "העתק ל-Excel" (TSV clipboard) — use case מרכזי | schedule-studio TaskTable.tsx, שיחה 9e6e7d0a | ❌ חסר |
| SCHED-23 | עמודת WBS stage נפרדת ונראית בטבלה ובExcel | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-24 | מיון בתוך phases: SD1, SD2, SD3, אחרים | שיחה 9e6e7d0a | ❌ חסר |

### 6ד. לוגיקת משימות

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-30 | שינוי תאריך → שינוי אוטומטי בהמשכים (cascading) | שיחה 9e6e7d0a שורה 185 | ❌ חסר |
| SCHED-31 | בלון אישור לפני שינוי מפל: "מה ישתנה, האם לאשר?" | שיחה 9e6e7d0a שורה 3269 | ❌ חסר |
| SCHED-32 | Critical path calculation | schedule-studio scheduleUtils.ts | ❌ חסר |
| SCHED-33 | שמירת שינויים (audit trail) ב-TaskChange | terminal3-scheduler tasks/[id]/route.ts | ❌ חסר |

### 6ה. ייבוא ויצוא

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-40 | ייבוא Excel עם זיהוי עמודות עברית/אנגלית | schedule-studio api/import/route.ts | ❌ חסר |
| SCHED-41 | יצירת לו"ז חדש ע"י גרירת קבצים | שיחה 7cf7fe1e שורה 4705 | ❌ חסר |
| SCHED-42 | יצוא PDF | terminal3-scheduler | ❌ חסר |
| SCHED-43 | שליחת דו"ח שבועי במייל (Cron ראשון 06:00) | terminal3-scheduler/CLAUDE.md, APPS.md | ❌ חסר |

### 6ו. לוגיסטיקה/פיגומים

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-50 | עמודת לוגיסטיקה — לוח פיגומים מבוסס שלבי התקנה | שיחה 9e6e7d0a שורה 3686 | ❌ חסר |
| SCHED-51 | פיגום מתחיל = שבועיים לפני עבודת אלומיניום קומה 5 | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-52 | פיגום נגמר = שבועיים אחרי סיום בולנוזים | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-53 | עלויות פיגום: שכירות, הקמה, פירוק, מנוף, מהנדס | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-54 | קטע גשר (פיגומים 11,25,29) = במה חשמלית, לא פיגום | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-55 | פיגומים 10,12,30 לא קיימים — למחוק | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-56 | עמודת רשת בטיחות | שיחה 9e6e7d0a | ❌ חסר |

### 6ז. כספים/תקציב

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-60 | דף P&L: הכנסות, אחוזי תשלום, הוצאות, רווח | שיחה 9e6e7d0a שורות 6118-6863 | ❌ חסר |
| SCHED-61 | עלויות: mock-up, ביצוע, עתידי/נוכחי, שולם/לא שולם | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-62 | דף תקציב ניתן לעריכה (לא רק דו"ח) מסונכרן עם לו"ז | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-63 | Tabs לניווט מהיר בין חלקי כספים | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-64 | בלונים (tooltips) לנתונים כספיים עם גלילה | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-65 | חישוב עלות לכל פרק מול תקציב, אחוזים ו-P&L לכל פעילות | שיחה 9e6e7d0a | ❌ חסר |

### 6ח. רכש משולב

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-70 | כפתור "הזמנת ציוד/רכש" בכל פעילות התקנה | שיחה 9e6e7d0a שורה 12454 | ❌ חסר |
| SCHED-71 | פריטים: ברגים, סיליקון, זכוכית, גומי, עוגנים, ציוד הרמה | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-72 | לכל פריט: שם, כמות, יחידה, תאריך נדרש, הערות | שיחה 9e6e7d0a | ❌ חסר (schema קיים ב-ProcurementItem) |
| SCHED-73 | סטטוס רכש: ממתין → הוזמן → סופק → התקבל באתר | שיחה 9e6e7d0a | ❌ חסר (schema יש status) |

### 6ט. נתוני Terminal 3

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SCHED-80 | חלוקה: בניין A ובניין B | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-81 | שלד אלומיניום קודם, אחריו זיגוג, מופרד לפי בניין | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-82 | "חלון מילוט" בפרק דלתות | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-83 | אבני דרך: "תחילת התקנה בניין A", "תחילת התקנה בניין B" | שיחה 9e6e7d0a | ❌ חסר |
| SCHED-84 | בנייה: קומה 4 = 01/11/2026, קצב 1.5 קומות/חודש | שיחה 9e6e7d0a | ❌ חסר |

---

## 7. ציוד הרמה (Equipment Module) — `/equipment`

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| EQUIP-01 | מודול `/equipment` — port של equipment-advisor | APPS.md, mydynamics-v2/CLAUDE.md | ❌ חסר — placeholder בלבד |
| EQUIP-02 | קטלוג ציוד: מנופים, במות, פיגומים, מלגזות | APPS.md, equipment-advisor/CLAUDE.md | ❌ חסר |
| EQUIP-03 | מנוע המלצות — ציוד מומלץ + חלופות + יתרונות/חסרונות | equipment-advisor/REQUIREMENTS.md | ❌ חסר |
| EQUIP-04 | סקיצת אתר אינטראקטיבית בדף המלצות | שיחה ab6361fb שורה 652 | ❌ חסר |
| EQUIP-05 | עגלת הזמנה מצטברת (cart) — כל ציוד → הזמנת רכש אחת | memory project_equipment_recommendation | ❌ חסר |
| EQUIP-06 | תאריך אספקה + משך שכירות + עלות יומית לכל פריט | שיחה b7ac4b11 שורה 1581 | ❌ חסר (schema קיים) |
| EQUIP-07 | שליחת PDF הזמנה אוטומטית | שיחה b7ac4b11 שורה 1944 | ❌ חסר |
| EQUIP-08 | עיצוב SaaS מקצועי — משטחים לבנים, צללים רכים, indigo | memory project_equipment_recommendation | ❌ חסר |
| EQUIP-09 | "פיגום תלוי" (לא פיגום מגדל עומד) | memory project_equipment_recommendation | ❌ חסר |
| EQUIP-10 | ייבוא קטלוג אמיר במות (amir.co.il) — 46 מודלים | שיחות equipment | ❌ חסר (נעשה באפליקציה הישנה) |

### Backlog (מ-REQUIREMENTS.md של equipment-advisor)

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| EQUIP-F01 | העלאת קבצים + AI חילוץ שדות (יצרן, דגם, מידות) | equipment-advisor/REQUIREMENTS.md | ❌ חסר |
| EQUIP-F02 | יצוא דו"ח: PDF, Excel, Priority ERP | equipment-advisor/REQUIREMENTS.md | ❌ חסר |
| EQUIP-F03 | גלריית תמונות — מספר צילומים לכל כלי, הגדלה | equipment-advisor/REQUIREMENTS.md | ❌ חסר |
| EQUIP-F04 | חיפוש שפה טבעית (NLU): "מנוף 100 טון" | equipment-advisor/REQUIREMENTS.md | ❌ חסר |
| EQUIP-F05 | פאנל ניהול: ציוד, מסמכים, תמונות, מחירים | equipment-advisor/REQUIREMENTS.md | ❌ חסר |
| EQUIP-F06 | השוואת כלים side-by-side | equipment-advisor/REQUIREMENTS.md | ❌ חסר |
| EQUIP-F07 | מועדפים, היסטוריית הזמנות, dark mode | equipment-advisor/REQUIREMENTS.md | ❌ חסר |
| EQUIP-F08 | AI ניתוח תמונת אתר → המלצת ציוד | equipment-advisor/REQUIREMENTS.md | ❌ חסר |

---

## 8. תמכור (Buyout Module) — `/buyout`

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| BUY-01 | מודול `/buyout` — ניהול הצעות מחיר ותקציבי רכש | APPS.md, תמכור/CLAUDE.md | ❌ חסר — placeholder בלבד |
| BUY-02 | חבילות עם תת-פריטים: כמויות, סכומים, עלויות | שיחה 992ab481 | ❌ חסר |
| BUY-03 | פתיחת "קיר מסך" → כל הפריטים הנדרשים מופיעים אוטומטית | שיחה 992ab481 | ❌ חסר |
| BUY-04 | קידוד צבעים: כחול=קלט, שחור=חישוב, ירוק=רווח, אדום=חריגה | שיחה 992ab481 | ❌ חסר |
| BUY-05 | AI חילוץ הצעות מחיר מקבצים (Anthropic API) | תמכור/CLAUDE.md, OLD-APPS-INFO.md | ❌ חסר |
| BUY-06 | Mobile-first RTL | שיחה 992ab481 | ❌ חסר |

---

## 9. סיכום ישיבות (Meetings Module) — `/meetings`

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| MEET-01 | מודול `/meetings` — הקלטה → תמלול → סיכום AI | APPS.md, meeting-summary-tool/CLAUDE.md | ❌ חסר — placeholder בלבד |
| MEET-02 | Anthropic API (claude-haiku-4-5) לניסוח מחדש | meeting-summary-tool/CLAUDE.md | ❌ חסר |
| MEET-03 | משתתפי ישיבה בראש הסיכום | שיחה b2311b11 | ❌ חסר |
| MEET-04 | החלטות לכל סעיף מתחת לטקסט; החלטות כלליות בסוף | שיחה b2311b11 | ❌ חסר |
| MEET-05 | ניהול רעיונות (ideas) | OLD-APPS-INFO.md | ❌ חסר |

---

## 10. שרטוטים (Drawings Module) — `/drawings`

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| DRAW-01 | מודול `/drawings` — צפייה בשרטוטי SD (PDF, DXF/DWG) | APPS.md, קוראה-SD/CLAUDE.md | ❌ חסר — placeholder בלבד |
| DRAW-02 | Client-side בלבד, אין backend/DB | APPS.md | ❌ חסר |
| DRAW-03 | תמיכה ב-SD1 (קומות 1-6), SD2 (7-10), SD3 (קומת קרקע) | שיחה f436e81e | ❌ חסר |
| DRAW-04 | עיצוב מודרני הקשור לתעשיית קירות מסך | שיחה f436e81e | ❌ חסר |

---

## 11. חיפוש רכש (Procurement Module) — `/procurement`

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| PROC-01 | מודול `/procurement` — חיפוש הזמנות רכש מ-Priority ERP | APPS.md, VARIATIONS.md | ❌ חסר — placeholder בלבד |
| PROC-02 | סרגל חיפוש פשוט וברור, עם תמונות | שיחה 77304a85 שורה 2 | ❌ חסר |
| PROC-03 | תצוגה מפוצלת: ימין=תוצאות, שמאל=תצוגה מקדימה | שיחה 77304a85 שורה 529 | ❌ חסר |
| PROC-04 | קל ונגיש — חייב לעבוד בנייד | שיחה 77304a85 שורות 1197+ | ❌ חסר |
| PROC-05 | כל מספר מסמך = מסמך אחד (לא כמה) | שיחה 77304a85 שורה 396 | ❌ חסר |
| PROC-06 | חיבור ל-Priority API או ייבוא תקופתי | VARIATIONS.md | ❌ חסר |

---

## 12. שרשרת הספקה (Supply Chain Module) — `/supply-chain`

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| SC-01 | מודול `/supply-chain` — מעקב משלוחי רכש מחו"ל | APPS.md, VARIATIONS.md | ❌ חסר — placeholder בלבד |
| SC-02 | תהליך: PO → אישור ספק → ניירת → משלוח ים → מכס → אספקה | שיחה af2b31db | ❌ חסר |
| SC-03 | כפתורים: סוג מוצר, איש קשר, נמל מוצא, סוג משלוח | שיחה af2b31db | ❌ חסר |
| SC-04 | העלאת קבצים (Excel/PDF) + תיקיית קבצים שמורים | שיחה af2b31db | ❌ חסר |
| SC-05 | כפתור סיכום/דו"ח רכש | שיחה af2b31db | ❌ חסר |
| SC-06 | גאנט עם תאריכי התחלה/יעד, פעולות, בלוני ציר זמן | שיחה af2b31db שורה 941 | ❌ חסר |
| SC-07 | קטגוריות חומר: זכוכית, אלומיניום, פרופילים, Alucobond, ברגים, אביזרים | שיחה af2b31db | ❌ חסר |
| SC-08 | סוג אריזה (משטח/ארגז) | שיחה af2b31db | ❌ חסר |

---

## 13. ניהול מערכת (Admin) — `/admin`

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| ADMIN-01 | דף `/admin` — CRUD משתמשים (email, name, phone, role) | mydynamics-v2/CLAUDE.md | ✅ עובד |
| ADMIN-02 | נגיש רק ל-ADMIN, redirect ל-dashboard לאחרים | src/app/(shell)/admin/page.tsx | ✅ עובד |
| ADMIN-03 | API ב-`/api/admin/users` | src/app/api/admin/users/route.ts | ✅ עובד |

---

## 14. כללי — חוצה מודולים

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| GEN-01 | מערכת אחת מאוחדת — מחליפה 10 אפליקציות נפרדות | CLAUDE.md שורש, mydynamics-v2/CLAUDE.md | 🔶 חלקי — תשתית קיימת, מודולים חסרים |
| GEN-02 | מספר משתמשים עובדים במקביל ממספר מחשבים | CLAUDE.md שורש, שיחה שורה 904 | 🔶 חלקי — auth עובד, sync/conflict חסר |
| GEN-03 | אבטחה ברמת Monday/MS Project | שיחה 7cf7fe1e שורה 904 | 🔶 חלקי — auth+RBAC עובדים, rate limit לא production |
| GEN-04 | "שינוי שנשמר באפליקציה חייב להשתנות לכולם" | שיחה 7cf7fe1e שורה 904 | 🔶 חלקי — SSE infra קיימת, לא מחוברת |
| GEN-05 | עבודה חיה — לפחות 5 משתמשים, עדכונים live | שיחה 7cf7fe1e שורה 1833 | 🔶 חלקי |
| GEN-06 | תמיד לענות בעברית | memory feedback_language_hebrew.md | ✅ (כלל עבודה) |
| GEN-07 | לבדוק לפני שאומרים "סודר" | שיחה, memory | ✅ (כלל עבודה) |
| GEN-08 | לשמור ידע פרויקט ב-CLAUDE.md, לא ב-memory שולחני | memory feedback_project_docs_in_claudemd.md | ✅ (כלל עבודה) |
| GEN-09 | קיצור MY-Dynamics.url בתיקיית קלודין — נקודת כניסה יחידה | שיחה 7cf7fe1e, memory feedback_single_shortcut | ✅ עובד |
| GEN-10 | קיצור MY-Dynamics.url על שולחן העבודה | שיחה נוכחית | ✅ עובד |

---

## 15. מנהל משימות (Task Widget) — לא חלק מ-V2

| # | דרישה | מקור | סטטוס |
|---|--------|------|--------|
| TASK-01 | ווידג'ט Electron לשולחן עבודה (לא חלק מ-V2 Web) | APPS.md, OLD-APPS-INFO.md | N/A — אפליקציה נפרדת |

---

## סתירות לבירור

| # | סתירה | צד א׳ | צד ב׳ | החלטה נדרשת |
|---|--------|-------|-------|------------|
| C-01 | הרשאות כספים — גישה לפי שם משתמש (דין/מאיר/אבי) + קוד גישה VS RBAC 5 תפקידים כלליים | שיחה 9e6e7d0a | src/lib/rbac.ts | האם לבנות הרשאה מיוחדת לדפי כספים, או מספיק ADMIN/MANAGER? |
| C-02 | שם חברה: "אלום עשת" (ב-layout.tsx description) VS "עשת דינמיקס" (memory) | src/app/layout.tsx | memory user_company_name | מה השם הנכון לממשק? |
| C-03 | Schedule Studio כמודול נפרד VS מיזוג עם Terminal 3 לתוך `/schedule` אחד | שיחה 7cf7fe1e שורה 4705 | תוכנית מאסטר | בתוך `/schedule` — כפתור "פרויקט חדש" שפותח Studio experience, או דף נפרד? |

---

## סיכום מצב

| קטגוריה | עובד | חלקי | חסר |
|----------|------|------|-----|
| Auth | 13 | 0 | 0 |
| RBAC | 9 | 0 | 1 ⚠️ |
| Infrastructure | 11 | 2 | 4 |
| UI Shell | 9 | 1 | 0 |
| Dashboard | 3 | 0 | 0 |
| Schedule | 0 | 0 | 35 |
| Equipment | 0 | 0 | 18 |
| Buyout | 0 | 0 | 6 |
| Meetings | 0 | 0 | 5 |
| Drawings | 0 | 0 | 4 |
| Procurement | 0 | 0 | 6 |
| Supply Chain | 0 | 0 | 8 |
| Admin | 3 | 0 | 0 |
| General | 6 | 4 | 0 |
| **סה"כ** | **54** | **7** | **87** |

**שלב 1 (תשתית) = מושלם.** 54 דרישות עובדות.
**שלבים 2-5 (מודולים) = חסר.** 87 דרישות ממתינות.
**3 סתירות** צריכות הכרעה לפני המשך.
