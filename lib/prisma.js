import 'dotenv/config'
import { PrismaClient } from '../generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'
// import { PrismaMariaDb } from '@prisma/adapter-mariadb'

// const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
// const adapter = new PrismaMariaDb({
//     host: process.env.DATABASE_HOST,
//     port: Number(process.env.DATABASE_PORT),
//     user: process.env.DATABASE_USER,
//     password: process.env.DATABASE_PASSWORD,
//     database: process.env.DATABASE_NAME,
// })

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
})

export const prisma = new PrismaClient({ adapter })




