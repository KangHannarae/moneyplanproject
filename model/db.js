import mysql from 'mysql2';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'user',
    password: '1234',
    database: 'money',
});

const db = pool.promise();
export default db;
// export default pool.promise();