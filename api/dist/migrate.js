import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
async function main() {
    const host = process.env.DATABASE_HOST ?? '127.0.0.1';
    const port = Number(process.env.DATABASE_PORT ?? '3306');
    const user = process.env.DATABASE_USER ?? 'root';
    const password = process.env.DATABASE_PASSWORD ?? '';
    const database = process.env.DATABASE_NAME ?? 'book_review_blog';
    const pool = mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        multipleStatements: true,
    });
    const migrationsDir = path.join(__dirname, '..', 'migrations');
    const files = fs
        .readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort();
    for (const file of files) {
        const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
        await pool.query(sql);
        // eslint-disable-next-line no-console
        console.log(`Applied migration: ${file}`);
    }
    await pool.end();
}
main().catch((e) => {
    console.error(e);
    process.exit(1);
});
