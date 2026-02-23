import mysql from 'mysql2/promise';

// const pool = mysql.createPool({
//   host: process.env.DB_HOST || 'localhost',
//   user: process.env.DB_USER || 'root',
//   password: process.env.DB_PASS || '',
//   database: process.env.DB_NAME || 'ai_re_db',
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0,
//   enableKeepAlive: true,
//   keepAliveInitialDelay: 0,
// });

const pool = mysql.createPool({
    host: 'centerbeam.proxy.rlwy.net',
    user: 'root',
    port: 17784,
    password: 'FMbnVcrcHvvpzxHPiskjpeEfvCUxsLQl',
    database: 'ai_re_db',
    waitForConnections: true,
    queueLimit: 0
});

pool.getConnection()
  .then((connection) => {
    console.log('✅ Database connected successfully');
    connection.release();
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
  });

export default pool;
