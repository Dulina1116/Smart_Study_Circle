import express from "express";
import { createAssistantResponse } from "../controllers/assistantController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.post("/chat", createAssistantResponse);

export default router;
