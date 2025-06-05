import mysql from 'mysql2';

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'mysql-ha3n.railway.internal',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'HpTXSrpmoVXRkmybWkqNxBvIKoFiHPBW',
  database: process.env.MYSQLDATABASE || 'railway',
  port: process.env.MYSQLPORT || 3306,
});

const db = pool.promise();
export default db;
