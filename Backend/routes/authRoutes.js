import express from "express";
import { register, login, logout } from "../authController.js";
import authMiddleware from "../authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", authMiddleware, logout);

export default router;