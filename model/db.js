import mysql from 'mysql2';

console.log('host:', process.env.MYSQLHOST);
console.log('user:', process.env.MYSQLUSER);
console.log('password:', process.env.MYSQLPASSWORD ? '****' : '없음');
console.log('database:', process.env.MYSQLDATABASE);
console.log('port:', process.env.MYSQLPORT);

const pool = mysql.createPool({
  host: process.env.MYSQLHOST || 'shortline.proxy.rlwy.net',
  user: process.env.MYSQLUSER || 'root',
  password: process.env.MYSQLPASSWORD || 'HpTXSrpmoVXRkmybWkqNxBvIKoFiHPBW',
  database: process.env.MYSQLDATABASE || 'money',
  port: Number(process.env.MYSQLPORT) || 11530,
});

const db = pool.promise();
export default db;

