import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../generated/prisma/client.js";
// import pkg from 'mariadb';
// const { createPool } = pkg;

const adapter = new PrismaMariaDb(process.env.DATABASE_URL);
// // สร้าง Connection Pool ของ mariadb โดยระบุพารามิเตอร์ให้ชัดเจน
// const pool = createPool({
//   host: "127.0.0.1",
//   port: 3306,
//   user: "root",
//   password: "password", 
//   database: "mock_up_db",
//   connectionLimit: 5,
// });

// const adapter = new PrismaMariaDb(pool);
const prisma = new PrismaClient({ adapter });

export { prisma };