const db = require('../../storage/db');

async function connectDB() {
  console.log(`CommandLink local SQLite storage ready at ${db.DB_PATH}`);
  return db;
}

module.exports = connectDB;
