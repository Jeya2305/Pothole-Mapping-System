const mysql = require("mysql2");

// MySQL Configuration
const dbConfig = {
    host: "127.0.0.1", // MySQL host
    user: "root", // MySQL username
    password: "Susi@123", // MySQL password
    database: "pothole_db", // Your database name
    port: 3306, // MySQL port (default is 3306)
    waitForConnections: true,
    connectionLimit: 10, // Max number of connections to create at once
    queueLimit: 0 // Max number of requests to queue before rejecting
};

// Create a connection pool
const pool = mysql.createPool(dbConfig);

// Test database connection once
pool.getConnection((err, connection) => {
    if (err) {
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);  // Exit if connection fails (or you could choose to retry)
    } else {
        console.log("✅ Connected to MySQL database!");
        connection.release();  // Release connection back to the pool
    }
});

module.exports = pool; // Export the pool for use in other files (server.js, etc.)

  