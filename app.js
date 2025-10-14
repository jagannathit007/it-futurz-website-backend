const path = require("path");

//Setting up environment and database 
const dotenv = require("dotenv");
dotenv.config({path: './.env'});
require("./config/database");

const express = require("express");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");

const app = express();

//Setting up CORS
app.use(cors({
  origin: ['http://localhost:4200', 'http://127.0.0.1:4200', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));  
app.use(cookieParser()); 

//Allow public users to access the uploads folder publically.
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

//Register API Routes
require("./routes/zindex").forEach((e) => app.use(e.path, e.file));

//Error handler for APIs
app.use((err, req, res, next) => {
  const statusCode =
    res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  let result = {
    message: err.message || "Internal Server Error",
    status: statusCode,
    data: null,
  };

  //Add Stacktrace in development mode only
  if (process.env.NODE_ENV == "dev") {
    result.stack = err.stack;
  }

  res.status(statusCode).json(result);
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

  if (isNaN(port)) {
    return val;
  }

  if (port >= 0) {
    return port;
  }

  return false;
}


function onError(error) {
  if (error.syscall !== "listen") {
    throw error;
  }

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
  let mode = process.env.NODE_ENV == "dev" ? "Developement Mode" : "Production Mode";
  console.log("-------------------");
  console.log(mode);
  console.log("-------------------");
  console.log(`🚀🚀 App is listening on :: ${bind}`);
}


module.exports = app;
