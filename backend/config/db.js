import mysql from 'mysql2/promise'

const db = await mysql.createPool({
  host: '172.21.136.179',
  user: 'newuser',
  password: 'newpassword',
  database: 'finance_tracker',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

export default db
