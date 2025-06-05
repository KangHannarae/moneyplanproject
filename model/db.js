import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'shortline.proxy.rlwy.net',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'HpTXSrpmoVXRkmybWkqNxBvIKoFiHPBW',
  database: process.env.MYSQLDATABASE || 'money',
  port: Number(process.env.MYSQLPORT) || 11530,
});

const db = pool.promise();
export default db;

