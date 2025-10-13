let mongoose = require("mongoose");

const mongoURI = process.env.MONGODB_URI || process.env.DATABASE_URL || 'mongodb://localhost:27017/itfuturz';
console.log("Connecting to MongoDB:", mongoURI);
mongoose.connect(mongoURI);
mongoose.connection
  .on("open", function () {
    console.log(`🍻 Cheers! Database connected.`);
  })
  .on("error", function (error) {
    console.log(`🚨 Connection Error: ${error}`);
  });
