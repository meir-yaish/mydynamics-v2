# MyDynamics — Baseline מצב המערכת

**עודכן:** אוקטובר 2026

---

## כתובת יחידה

```
https://mydynamics-v2.vercel.app
```

זו הכתובת היחידה של המערכת. **אין כתובות נוספות.**  
כל האפליקציות הישנות נמחקו מ-Vercel.

---

## אפליקציות שנמחקו מ-Vercel (לא קיימות יותר)

| פרויקט שנמחק | URL לשעבר |
|---|---|
| terminal3-scheduler | terminal3-scheduler-nine.vercel.app |
| schedule-studio | schedule-studio-three.vercel.app |
| equipment-advisor | equipment-advisor.vercel.app |
| buyout-tool | buyout-tool.vercel.app |
| koreh-sd | koreh-sd.vercel.app |
| dynamics-control | dynamics-control.vercel.app |
| rechesh-dmitri | rechesh-dmitri.vercel.app |

---

## מודולים פנימיים — כתובות עכשוויות

| # | מודול | נתיב | סטטוס |
|---|---|---|---|
| 1 | לוח זמנים — טרמינל 3 | `/schedule` | ✅ פעיל |
| 2 | לוח זמנים — סטודיו | — | 🔧 בהכנה |
| 3 | ציוד הרמה | `/equipment` | ✅ פעיל |
| 4 | תמכור | `/buyout` | ✅ פעיל |
| 5 | שרשרת הספקה | `/supply-chain` | ✅ פעיל |
| 6 | חיפוש רכש | `/procurement` | ✅ פעיל |
| 7 | סיכום ישיבות | `/meetings` | ✅ פעיל |
| 8 | שרטוטים | `/drawings` | ✅ פעיל |

---

## Database

- **ספק:** Neon PostgreSQL (us-east-2)
- **ORM:** Prisma 7
- **3 פרויקטים בלוח הזמנים:**
  - טרמינל סנטר 3 - אור יהודה (257 משימות)
  - טרמינל סנטר 3 — לוח זמנים תכנון (120 משימות)
  - טרמינל סנטר 3 - לוגיסטיקה (104 משימות)

---

## Deploy

```bash
vercel --prod --scope meir7
```

דורש אישור מפורש לפני כל הרצה.
