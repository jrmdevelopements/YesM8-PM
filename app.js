const express = require("express");
const cors = require("cors");
require("dotenv").config();

const jobRoutes = require("./src/routes/jobRoutes");
const pool = require("./src/config/db");

const app = express();
const PORT = process.env.PORT || 3000;

// ─── MIDDLEWARE ──────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── FIX FOR SUBFOLDER (cPanel/Passenger) ──────────────────
// This removes the base path (/yesm8pm/live) from the URL
// so your routes (/, /api) work correctly.
const basePath = process.env.PASSENGER_BASE_URI || '';
app.use((req, res, next) => {
    if (basePath && req.url.startsWith(basePath)) {
        req.url = req.url.slice(basePath.length) || '/';
    }
    next();
});
// ─── END OF FIX ─────────────────────────────────────────────

// ─── ROUTES ──────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "YesM8 Job API",
    version: "1.0.0",
  });
});

app.use("/api", jobRoutes);

// ─── ERROR HANDLERS ─────────────────────────────────────────
// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Endpoint not found" });
});

// ─── GRACEFUL SHUTDOWN ──────────────────────────────────────
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

let isShuttingDown = false;

async function gracefulShutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${signal} received. Shutting down gracefully...`);

  server.close(async (err) => {
    if (err) {
      console.error("Error closing server:", err.message);
      process.exit(1);
    }
    console.log("HTTP server closed.");
    try {
      await pool.end();
      console.log("Database pool closed.");
    } catch (dbErr) {
      console.error("Error closing DB:", dbErr.message);
    }
    console.log("Exiting.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Could not close connections in time, forcing exit.");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection:", reason);
  gracefulShutdown("unhandledRejection");
});