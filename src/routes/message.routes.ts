import { Router } from "express";
import messageController from "../controllers/message.controller";
import upload from "../middleware/upload.middleware";

const router = Router();

router.post("/", upload.none(), messageController.addMessage);

router.post("/personal", upload.none(), messageController.addPersonalMessage);

export default router;
