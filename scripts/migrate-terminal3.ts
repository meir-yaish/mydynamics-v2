/**
 * migrate-terminal3.ts
 *
 * Migrates schedule data from terminal3 DB → mydynamics DB.
 *
 * Usage:
 *   npx tsx scripts/migrate-terminal3.ts --dry-run   (required first pass)
 *   npx tsx scripts/migrate-terminal3.ts             (live — needs Meir's approval)
 *   npx tsx scripts/migrate-terminal3.ts --force     (live, even if target has data)
 *
 * Env vars required:
 *   DATABASE_URL            = mydynamics Neon connection string (in .env)
 *   DATABASE_URL_TERMINAL3  = terminal3 Neon connection string
 */

import { Client } from 'pg'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Auto-load .env (tsx doesn't load it automatically)
try {
  const raw = readFileSync(resolve(process.cwd(), '.env'), 'utf-8')
  for (const line of raw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
    }
  }
} catch { /* .env not found — rely on shell env */ }

const DRY_RUN = process.argv.includes('--dry-run')
const FORCE   = process.argv.includes('--force')

const TERMINAL3_URL = process.env.DATABASE_URL_TERMINAL3
const MYDYNAMICS_URL = process.env.DATABASE_URL

if (!TERMINAL3_URL) {
  console.error('❌ DATABASE_URL_TERMINAL3 env var is required.')
  console.error('   Add it to .env or run:')
  console.error('   $env:DATABASE_URL_TERMINAL3="postgresql://..."')
  process.exit(1)
}
if (!MYDYNAMICS_URL) {
  console.error('❌ DATABASE_URL env var is required (should already be in .env).')
  process.exit(1)
}

async function main() {
  console.log(DRY_RUN
    ? '🔍 DRY-RUN MODE — reading source data only, no changes will be made\n'
    : '🚀 LIVE MIGRATION MODE\n'
  )

  const src = new Client({ connectionString: TERMINAL3_URL })
  const dst = new Client({ connectionString: MYDYNAMICS_URL })

  await src.connect()
  await dst.connect()

  try {
    // ─── Safety check ───────────────────────────────────────────────────────
    const { rows: [{ cnt }] } = await dst.query<{ cnt: string }>(
      'SELECT COUNT(*) as cnt FROM "Project"'
    )
    const existingCount = parseInt(cnt)
    if (existingCount > 0 && !FORCE) {
      console.log(`⚠️  mydynamics DB already has ${existingCount} project(s).`)
      console.log(`   Run with --force to migrate anyway (existing IDs are skipped, not overwritten).`)
      console.log(`   Or truncate the schedule tables first if you want a clean migration.`)
      process.exit(1)
    }
    if (existingCount > 0) {
      console.log(`⚠️  --force: ${existingCount} project(s) already in target — existing IDs will be skipped.\n`)
    }

    // ─── Read all data from terminal3 ───────────────────────────────────────
    const [
      { rows: projects },
      { rows: tasks },
      { rows: taskChanges },
      { rows: milestones },
      { rows: recipients },
      { rows: baselines },
      { rows: baselineTasks },
      { rows: procurementItems },
      { rows: facadeRegions },
      { rows: settings },
    ] = await Promise.all([
      src.query('SELECT * FROM "Project" ORDER BY "createdAt"'),
      src.query('SELECT * FROM "Task" ORDER BY "createdAt"'),
      src.query('SELECT * FROM "TaskChange" ORDER BY "changedAt"'),
      src.query('SELECT * FROM "Milestone"'),
      src.query('SELECT * FROM "Recipient"'),
      src.query('SELECT * FROM "Baseline" ORDER BY "createdAt"'),
      src.query('SELECT * FROM "BaselineTask"'),
      src.query('SELECT * FROM "ProcurementItem" ORDER BY "createdAt"'),
      src.query('SELECT * FROM "FacadeRegion"'),
      src.query('SELECT * FROM "Settings"'),
    ])

    console.log('📦 Source data (terminal3):')
    console.log(`  Projects:        ${projects.length}`)
    console.log(`  Tasks:           ${tasks.length}`)
    console.log(`  TaskChanges:     ${taskChanges.length}`)
    console.log(`  Milestones:      ${milestones.length}`)
    console.log(`  Recipients:      ${recipients.length}`)
    console.log(`  Baselines:       ${baselines.length}`)
    console.log(`  BaselineTasks:   ${baselineTasks.length}`)
    console.log(`  ProcurementItems:${procurementItems.length}`)
    console.log(`  FacadeRegions:   ${facadeRegions.length}`)
    console.log(`  Settings:        ${settings.length}`)
    console.log()

    if (DRY_RUN) {
      console.log('✅ Dry-run complete — data read successfully from terminal3.')
      console.log('   No changes were made to mydynamics DB.')
      console.log('\nTo run the live migration:')
      console.log('  npx tsx scripts/migrate-terminal3.ts')
      return
    }

    const now = new Date()

    // ─── 1. Settings (skip emailPassword — not in mydynamics schema) ────────
    let settingsInserted = 0
    for (const s of settings) {
      await dst.query(`
        INSERT INTO "Settings" (id, "emailFrom", "weeklyReportDay", "weeklyReportTime")
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET
          "emailFrom"       = EXCLUDED."emailFrom",
          "weeklyReportDay" = EXCLUDED."weeklyReportDay",
          "weeklyReportTime"= EXCLUDED."weeklyReportTime"
      `, [s.id, s.emailFrom, s.weeklyReportDay, s.weeklyReportTime])
      settingsInserted++
    }
    console.log(`✅ Settings:        ${settingsInserted}`)

    // ─── 2. Projects ─────────────────────────────────────────────────────────
    let projectsInserted = 0
    for (const p of projects) {
      await dst.query(`
        INSERT INTO "Project"
          (id, name, description, "paidPercent", "expensesPaidPercent", "createdAt", "updatedAt", version)
        VALUES ($1,$2,$3,$4,$5,$6,$7,1)
        ON CONFLICT (id) DO NOTHING
      `, [p.id, p.name, p.description, p.paidPercent, p.expensesPaidPercent, p.createdAt, now])
      projectsInserted++
    }
    console.log(`✅ Projects:        ${projectsInserted}`)

    // ─── 3. Tasks ────────────────────────────────────────────────────────────
    let tasksInserted = 0
    for (const t of tasks) {
      await dst.query(`
        INSERT INTO "Task"
          (id,"projectId",name,phase,responsible,"startDate","endDate",progress,dependencies,
           notes,color,"order",stage,"subStage",building,facade,floors,"scaffoldingNum",
           cost,revenue,quantity,"costLogistics","costInstallation","costManagement",
           "quotedPrice","costBreakdown","wbsStage","sdPhase","customImage","customImageRegion",
           "createdAt","updatedAt",version)
        VALUES
          ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,1)
        ON CONFLICT (id) DO NOTHING
      `, [
        t.id, t.projectId, t.name, t.phase, t.responsible, t.startDate, t.endDate,
        t.progress, t.dependencies ?? '[]', t.notes, t.color ?? '#4472C4', t.order ?? 0,
        t.stage, t.subStage, t.building, t.facade, t.floors, t.scaffoldingNum,
        t.cost, t.revenue, t.quantity, t.costLogistics, t.costInstallation, t.costManagement,
        t.quotedPrice, t.costBreakdown, t.wbsStage, t.sdPhase, t.customImage, t.customImageRegion,
        t.createdAt, t.updatedAt ?? now,
      ])
      tasksInserted++
    }
    console.log(`✅ Tasks:           ${tasksInserted}`)

    // ─── 4. TaskChanges ──────────────────────────────────────────────────────
    let changesInserted = 0
    for (const c of taskChanges) {
      await dst.query(`
        INSERT INTO "TaskChange" (id,"taskId",field,"oldValue","newValue","changedBy","changedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7)
        ON CONFLICT (id) DO NOTHING
      `, [c.id, c.taskId, c.field, c.oldValue, c.newValue, c.changedBy, c.changedAt])
      changesInserted++
    }
    console.log(`✅ TaskChanges:     ${changesInserted}`)

    // ─── 5. Milestones ───────────────────────────────────────────────────────
    let milestonesInserted = 0
    for (const m of milestones) {
      await dst.query(`
        INSERT INTO "Milestone" (id,"projectId",name,date,status,notes,version)
        VALUES ($1,$2,$3,$4,$5,$6,1)
        ON CONFLICT (id) DO NOTHING
      `, [m.id, m.projectId, m.name, m.date, m.status ?? 'green', m.notes])
      milestonesInserted++
    }
    console.log(`✅ Milestones:      ${milestonesInserted}`)

    // ─── 6. Recipients ───────────────────────────────────────────────────────
    let recipientsInserted = 0
    for (const r of recipients) {
      await dst.query(`
        INSERT INTO "Recipient" (id,"projectId",name,email,phone,active)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (id) DO NOTHING
      `, [r.id, r.projectId, r.name, r.email, r.phone, r.active ?? true])
      recipientsInserted++
    }
    console.log(`✅ Recipients:      ${recipientsInserted}`)

    // ─── 7. Baselines ────────────────────────────────────────────────────────
    let baselinesInserted = 0
    for (const b of baselines) {
      await dst.query(`
        INSERT INTO "Baseline" (id,"projectId",name,"createdAt","createdBy")
        VALUES ($1,$2,$3,$4,$5)
        ON CONFLICT (id) DO NOTHING
      `, [b.id, b.projectId, b.name, b.createdAt, b.createdBy])
      baselinesInserted++
    }
    console.log(`✅ Baselines:       ${baselinesInserted}`)

    // ─── 8. BaselineTasks ────────────────────────────────────────────────────
    let baselineTasksInserted = 0
    for (const bt of baselineTasks) {
      await dst.query(`
        INSERT INTO "BaselineTask" (id,"baselineId","taskId",name,phase,"startDate","endDate",progress)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (id) DO NOTHING
      `, [bt.id, bt.baselineId, bt.taskId, bt.name, bt.phase, bt.startDate, bt.endDate, bt.progress])
      baselineTasksInserted++
    }
    console.log(`✅ BaselineTasks:   ${baselineTasksInserted}`)

    // ─── 9. ProcurementItems ─────────────────────────────────────────────────
    let procInserted = 0
    for (const pi of procurementItems) {
      await dst.query(`
        INSERT INTO "ProcurementItem"
          (id,"taskId","projectId",name,sku,quantity,unit,"neededByDate",notes,status,"createdAt","updatedAt",version)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,1)
        ON CONFLICT (id) DO NOTHING
      `, [
        pi.id, pi.taskId, pi.projectId, pi.name, pi.sku, pi.quantity, pi.unit,
        pi.neededByDate, pi.notes, pi.status ?? 'ממתין', pi.createdAt, pi.updatedAt ?? now,
      ])
      procInserted++
    }
    console.log(`✅ ProcurementItems:${procInserted}`)

    // ─── 10. FacadeRegions ───────────────────────────────────────────────────
    let facadeInserted = 0
    for (const fr of facadeRegions) {
      await dst.query(`
        INSERT INTO "FacadeRegion" (id,key,code,"xPct","yPct","wPct","hPct","updatedAt")
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        ON CONFLICT (key, code) DO UPDATE SET
          "xPct"      = EXCLUDED."xPct",
          "yPct"      = EXCLUDED."yPct",
          "wPct"      = EXCLUDED."wPct",
          "hPct"      = EXCLUDED."hPct",
          "updatedAt" = EXCLUDED."updatedAt"
      `, [fr.id, fr.key, fr.code, fr.xPct, fr.yPct, fr.wPct, fr.hPct, fr.updatedAt ?? now])
      facadeInserted++
    }
    console.log(`✅ FacadeRegions:   ${facadeInserted}`)

    console.log('\n🎉 Migration complete!')
    console.log('   Verify at: https://mydynamics-v2.vercel.app/schedule')

  } finally {
    await src.end()
    await dst.end()
  }
}

main().catch(err => {
  console.error('\n❌ Migration failed:', err.message)
  process.exit(1)
})
