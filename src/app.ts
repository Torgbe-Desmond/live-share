// src/index.ts
import { app, server } from "./server";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";

dotenv.config();

const PORT = process.env.PORT || 5000;

// CORS
app.use(
  cors({
    origin:process.env.FRONTEND,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

// Routes
import mainRouter from "./routes/index";  
app.use("/api", mainRouter);

// Middleware
import errorMiddleware from "./middleware/error.middleware";
import notFoundMiddleware from "./middleware/notFound.middleware";

app.use(notFoundMiddleware);
app.use(errorMiddleware);

// Start server
const start = async (): Promise<void> => {
  try {
    server.listen(PORT, () => {
      console.info(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server failed to start:", error);
  }
};

start();