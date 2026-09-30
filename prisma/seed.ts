import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const password = process.env.ADMIN_SEED_PASSWORD
  if (!password) {
    console.error('Set ADMIN_SEED_PASSWORD in .env before seeding')
    process.exit(1)
  }

  const passwordHash = await hash(password, 12)

  const meir = await prisma.user.upsert({
    where: { email: 'meir@eshetdynamics.co.il' },
    update: { passwordHash, phone: 'REDACTED_PHONE', role: 'ADMIN' },
    create: {
      email: 'meir@eshetdynamics.co.il',
      name: 'מאיר',
      phone: 'REDACTED_PHONE',
      passwordHash,
      role: 'ADMIN',
    },
  })

  console.log(`Admin user ready: ${meir.email} (${meir.id})`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e)
    prisma.$disconnect()
    process.exit(1)
  })
