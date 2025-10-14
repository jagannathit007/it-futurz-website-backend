const path = require("path");
const dotenv = require("dotenv");
dotenv.config({path: './.env'});
require("./config/database");

const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const app = express();

// Permissive CORS configuration (allows all origins)
app.use(cors({
  origin: true, // Allows all origins
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin',
    'X-Access-Token'
  ],
  optionsSuccessStatus: 200
}));

// Handle all preflight requests
app.options('*', cors());

app.use(logger("dev"));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));  
app.use(cookieParser()); 

// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'CORS is working!', 
    timestamp: new Date(),
    origin: req.headers.origin,
    method: req.method
  });
});

//Register API Routes
require("./routes/zindex").forEach((e) => app.use(e.path, e.file));

//Error handler for APIs
app.use((err, req, res, next) => {
  console.error('Error:', err); 
  
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  
  let result = {
    message: err.message || "Internal Server Error",
    status: statusCode,
    data: null,
  };

  if (process.env.NODE_ENV === "dev") {
    result.stack = err.stack;
  }

  res.status(statusCode).json(result);
});

// 404 handler - PLACE THIS AFTER ALL ROUTES
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route not found',
    status: 404,
    data: null
  });
});

var debug = require("debug")("node-boilerplate:server");
var http = require("http");

var port = normalizePort(process.env.PORT || "3000");
app.set("port", port);

var server = http.createServer(app);

server.listen(port);
server.on("error", onError);
server.on("listening", onListening);

function normalizePort(val) {
  var port = parseInt(val, 10);
  if (isNaN(port)) return val;
  if (port >= 0) return port;
  return false;
}

function onError(error) {
  if (error.syscall !== "listen") throw error;
  var bind = typeof port === "string" ? "Pipe " + port : "Port " + port;
  switch (error.code) {
    case "EACCES":
      console.error(bind + " requires elevated privileges");
      process.exit(1);
      break;
    case "EADDRINUSE":
      console.error(bind + " is already in use");
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  var addr = server.address();
  var bind = typeof addr === "string" ? "pipe " + addr : "port " + addr.port;
  let mode = process.env.NODE_ENV === "dev" ? "Development Mode" : "Production Mode";
  console.log("-------------------");
  console.log(mode);
  console.log("-------------------");
  console.log(`🚀 App is listening on :: ${bind}`);
  console.log(`📡 Test CORS at: http://localhost:${port}/api/test`);
  console.log("✅ CORS configured to allow all origins");
}

module.exports = app;