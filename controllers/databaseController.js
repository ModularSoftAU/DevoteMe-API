import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  user: process.env.DBUSER,
  password: process.env.DBPASSWORD,
  database: process.env.DBNAME,
  multipleStatements: true
}).promise();

// Function to get a connection and log a message
async function initializePool() {
  try {
    const connection = await pool.getConnection();
    console.log(`[CONSOLE] [DB] Database pool connection is successful.`);
    connection.release();
  } catch (err) {
    console.error(`[ERROR] [DB] There was an error connecting:\n ${err.stack}`);
  }
}

// Call the initialization function
initializePool();

export default pool;
