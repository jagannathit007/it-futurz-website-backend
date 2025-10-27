const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: './.env' });
require("./config/database");

const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const compression = require("compression");
const helmet = require("helmet");

const app = express();

// Security
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Performance
app.use(compression());

// CORS
app.use(cors({
  credentials: true,
  optionsSuccessStatus: 200
}));

// Logging
if (process.env.NODE_ENV === "dev") {
  app.use(logger("dev"));
}

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));  
app.use(cookieParser());

// Static files
const staticOptions = {
  maxAge: process.env.NODE_ENV === "dev" ? 0 : '1d'
};
app.use("/uploads", express.static(path.join(__dirname, "uploads"), staticOptions));
app.use(express.static(path.join(__dirname, "public")));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
require("./routes/zindex").forEach((route) => app.use(route.path, route.file));

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 404
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    status: statusCode
  });
});

// Server setup
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log("═══════════════════════════════");
  console.log(`🚀 Server running on port ${port}`);
  console.log(`🏥 Health: http://localhost:${port}/health`);
  console.log("═══════════════════════════════");
});

// Graceful shutdown
process.on('SIGTERM', () => gracefulShutdown());
process.on('SIGINT', () => gracefulShutdown());

function gracefulShutdown() {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });

  setTimeout(() => {
    console.log('⚠️ Forced shutdown');
    process.exit(1);
  }, 10000);
}

module.exports = app;