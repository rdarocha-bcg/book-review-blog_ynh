import mysql from 'mysql2/promise';
export function createPool() {
    const host = process.env.DATABASE_HOST ?? '127.0.0.1';
    const port = Number(process.env.DATABASE_PORT ?? '3306');
    const user = process.env.DATABASE_USER ?? 'root';
    const password = process.env.DATABASE_PASSWORD ?? '';
    const database = process.env.DATABASE_NAME ?? 'book_review_blog';
    return mysql.createPool({
        host,
        port,
        user,
        password,
        database,
        waitForConnections: true,
        connectionLimit: 10,
        namedPlaceholders: true,
    });
}
