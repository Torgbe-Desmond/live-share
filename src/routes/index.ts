// src/routes/index.ts
import { Router } from "express";

const router = Router();

// Test route
router.get("/", (_, res) => {
  res.json({ message: "we are chatting!!!" });
});

// Import other route modules
import messageRoutes from "./message.routes";
import userRoutes from "./user.routes";

router.use("/messages", messageRoutes);
router.use("/users", userRoutes);

export default router;