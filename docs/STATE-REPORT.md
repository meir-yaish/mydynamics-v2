# STATE REPORT — Schedule Module Integration

**תאריך:** 12/10/2026  
**מה נבנה:** אינטגרציה מלאה של terminal3-scheduler כמודול לוח זמנים ב-mydynamics-v2

---

## סטטוס: מוכן למיגרציה — Deploy בוצע

---

## מה בוצע בסשן זה

### API Routes — נוצרו ב-`src/app/api/schedule/`

| Route | Method | תיאור |
|---|---|---|
| `projects/route.ts` | GET, PUT | פרויקטים — רשימה + עדכון אחוז תשלום |
| `tasks/route.ts` | GET, POST | משימות — קריאה ויצירה |
| `tasks/[id]/route.ts` | GET, PUT, DELETE | משימה בודדת + cascade תלויות |
| `milestones/route.ts` | GET, POST, PUT, DELETE | אבני דרך |
| `baselines/route.ts` | GET, POST | בייסליינים |
| `baselines/[id]/route.ts` | GET, DELETE | בייסליין בודד |
| `procurement/route.ts` | GET, POST | רכש |
| `procurement/[id]/route.ts` | PUT, DELETE | פריט רכש |
| `recipients/route.ts` | GET, POST, PUT, DELETE | נמענים |
| `facade-regions/route.ts` | GET, POST, DELETE | אזורי חזית |
| `settings/route.ts` | GET, PUT | הגדרות singleton |
| `send-update/route.ts` | POST | שליחת עדכון מייל |
| `dependencies/auto-link/route.ts` | POST | קישור אוטומטי תלויות בין פאזות |
| `weekly-report/route.ts` | GET | דוח שבועי (cron, Bearer auth) |

### Lib Files — נוצרו ב-`src/lib/schedule/`

| קובץ | תוכן |
|---|---|
| `calendar.ts` | חגים יהודיים + מוסלמיים, ימי עבודה |
| `facadeImages.ts` | הגדרות תמונות חזית לפי `בניין\|חזית` |
| `email.ts` | nodemailer sender עם GMAIL_FROM + GMAIL_APP_PASSWORD |

### Components — נוצרו ב-`src/components/schedule/`

| קומפוננטה | תיאור |
|---|---|
| `GanttChart.tsx` | גאנט מלא (976 שורות) — SVG עם baselines, תלויות, cascade, חזית |
| `TaskTable.tsx` | טבלת משימות + ייצוא Excel |
| `MilestoneStatus.tsx` | כרטיסיות אבני דרך |
| `ProcurementPanel.tsx` | פאנל רכש עם forwardRef |
| `FacadeView.tsx` | תצוגת חזית עם draw-to-select |
| `TaskImageEditor.tsx` | עריכת תמונה למשימה |
| `CostAnalysisGate.tsx` | שמירה על תצוגת כספים רק ל-ADMIN/MANAGER |
| `FinanceNav.tsx` | לינק לעמוד כספים |

### Pages — נוצרו/עודכנו ב-`src/app/(shell)/schedule/`

| עמוד | סטטוס |
|---|---|
| `page.tsx` | ✅ מלא — גאנט + טבלה + אבני דרך, useSession auth |
| `settings/page.tsx` | ✅ מלא — הגדרות + נמענים + בייסליינים |
| `finance/page.tsx` | ✅ מלא — auth gate + כל הטאבים + quote-check פעיל |

---

## מה עדיין לא בוצע

### 1. מיגרציית נתונים מ-terminal3 → mydynamics-v2

**סקריפט מוכן:** `scripts/migrate-terminal3.ts`

כדי להריץ:
```powershell
# צעד 1 — גיבוי (חובה לפני מיגרציה)
pg_dump "postgresql://neondb_owner:npg_k3ZAxdg8TCsl@ep-little-dawn-aqt8iny0.c-8.us-east-1.aws.neon.tech/neondb_test?sslmode=require" > backup_terminal3_20261012.sql
pg_dump "postgresql://neondb_owner:npg_whlKX5JmdVn2@ep-wispy-glitter-b4ho3xrn.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require" > backup_mydynamics_20261012.sql

# צעד 2 — dry-run (אין לדלג)
$env:DATABASE_URL_TERMINAL3="postgresql://neondb_owner:npg_k3ZAxdg8TCsl@ep-little-dawn-aqt8iny0.c-8.us-east-1.aws.neon.tech/neondb_test?sslmode=require"
npx tsx scripts/migrate-terminal3.ts --dry-run

# צעד 3 — מיגרציה אמיתית (דורשת אישור מאיר)
npx tsx scripts/migrate-terminal3.ts
```

> **⚠️ IRON RULE:** אסור להריץ מיגרציה בלי אישור מפורש של מאיר!

### 2. Deploy ל-Production עם שינויי finance/quote-check

> **⚠️ IRON RULE:** `vercel --prod --scope meir7` — דורש אישור מפורש של מאיר!

---

## Build Status

```
✅ TypeScript — no errors
✅ next build — passes
✅ /schedule route — dynamic
✅ /schedule/finance route — dynamic
✅ /schedule/settings route — dynamic
✅ 14 API routes — all /api/schedule/*
```

---

## IRON RULES (תזכורת)

1. Deploy ל-Production → **דורש אישור מפורש של מאיר**
2. אין למחוק DB/deployments/branches/קבצים בלי אישור
3. אין ליצור פרויקט Vercel חדש — רק `mydynamics-v2`
4. לפני כל migration — `pg_dump` גיבוי + dry-run קודם
5. terminal3-scheduler לא נמחק עד שכל הבדיקות עוברות ויש אישור מאיר
6. ה-DB של terminal3 לא נמחק לעולם — נשמר כגיבוי
7. auto-seed לעולם לא רץ על DB שיש בו נתונים

---

## קישורים

- **mydynamics-v2 production:** https://mydynamics-v2.vercel.app
- **terminal3-scheduler (פעיל):** https://terminal3-scheduler-nine.vercel.app
- **GitHub:** mydynamics-v2 repo (master branch)
