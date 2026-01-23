import express from "express";
import passport from "passport";

import {
  register,
  login,
  googleCallback,
  getCurrentUser,
  getSession,
  logout,
  googleMobileLogin, // <-- new controller
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Email/Password Authentication
router.post("/register", register);
router.post("/login", login);

// Google OAuth (Web)
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));
router.get("/google/callback", passport.authenticate("google", { failureRedirect: "/api/auth/login" }), googleCallback);

// Google OAuth (Mobile)
router.post("/google/token", googleMobileLogin); // <-- mobile clients send ID token here

// Check session (for backward compatibility with frontend)
router.get("/session", getSession);

// Protected routes
router.get("/me", verifyToken, getCurrentUser);
router.post("/logout", logout);

export default router;
