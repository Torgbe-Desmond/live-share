"use strict";
const { io, app, server } = require("./server");
const cors = require("cors");
require("dotenv").config();
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5000;
// origin: ,

// CORS setup
app.use(
  cors({
    origin: [
      "https://live-share-frontend.vercel.app",
      "http://localhost:3000",
      "http://localhost:56708",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Middleware setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
// Routes
app.use("/api", require("./routes/index"));

// Custom middleware for handling errors
app.use(require("./middleware/error.middleware"));
app.use(require("./middleware/notFound.middleware"));

// Start server
const start = async () => {
  try {
    server.listen(PORT, () => {
      console.info(`App is running on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
