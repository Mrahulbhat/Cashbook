import express from "express";
import {
  getAllCategories,
  getCategoryData,
  addCategory,
  updateCategory,
  deleteCategory,
  getCategoriesByType,
  getCategoriesByParent,
  getCategoryByName,
} from "../controllers/category.controller.js";
import { verifyToken } from "../middleware/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(verifyToken);

// Get all categories
router.get("/", getAllCategories);

// Get categories by type (income or expense)
router.get("/type/:type", getCategoriesByType);

// Get categories by parent category
router.get("/parent/:parentCategory", getCategoriesByParent);

// Get category by name
router.get("/name/:name", getCategoryByName);

// Get single category by ID
router.get("/:id", getCategoryData);

// Add new category
router.post("/new", addCategory);

// Update category
router.put("/:id", updateCategory);

// Delete category
router.delete("/:id", deleteCategory);

export default router;
