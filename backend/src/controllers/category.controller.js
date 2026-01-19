import Category from "../models/category.model.js";
import {
  getCache,
  setCache,
  clearCacheByPrefix,
} from "../config/cache.js";

/* =========================
   GET ALL CATEGORIES
========================= */
export const getAllCategories = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cacheKey = `categories:all:${userId}`;
    const cached = getCache(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

    const categories = await Category.find({ userId });
    setCache(cacheKey, categories);

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET CATEGORY BY ID
========================= */
export const getCategoryData = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const cacheKey = `categories:${id}:${userId}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    setCache(cacheKey, category);
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   ADD CATEGORY
========================= */
export const addCategory = async (req, res) => {
  try {
    const { name, type, parentCategory, budget } = req.body;
    const userId = req.user.userId;

    if (!name || !type || !parentCategory) {
      return res.status(400).json({
        message: "Missing required fields: name, type, parentCategory",
      });
    }

    if (!["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({
        message: "Type must be 'income' or 'expense'",
      });
    }

    const existingCategory = await Category.findOne({ name, userId });
    if (existingCategory) {
      return res.status(400).json({
        message: "Category with this name already exists",
      });
    }

    const category = new Category({
      userId,
      name,
      type: type.toLowerCase(),
      parentCategory,
      budget,
    });

    const savedCategory = await category.save();

    // invalidate all category caches
    clearCacheByPrefix(`categories:all:${userId}`);

    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   UPDATE CATEGORY
========================= */
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, parentCategory, budget } = req.body;
    const userId = req.user.userId;

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name, userId });
      if (existingCategory) {
        return res.status(400).json({
          message: "Category with this name already exists",
        });
      }
    }

    if (type && !["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({
        message: "Type must be 'income' or 'expense'",
      });
    }

    category.name = name || category.name;
    category.type = type ? type.toLowerCase() : category.type;
    category.parentCategory = parentCategory || category.parentCategory;
    category.budget = budget !== undefined ? budget : category.budget;

    const updatedCategory = await category.save();

    clearCacheByPrefix(`categories:all:${userId}`);

    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE CATEGORY
========================= */
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const category = await Category.findOne({ _id: id, userId });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.findByIdAndDelete(id);

    clearCacheByPrefix(`categories:all:${userId}`);

    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET CATEGORIES BY TYPE
========================= */
export const getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.userId;

    if (!["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({
        message: "Type must be 'income' or 'expense'",
      });
    }

    const cacheKey = `categories:type:${type.toLowerCase()}:${userId}`;
    const cached = getCache(cacheKey);

    if (cached) {
      return res.status(200).json(cached);
    }

    const categories = await Category.find({
      userId,
      type: type.toLowerCase(),
    });

    setCache(cacheKey, categories);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET CATEGORIES BY PARENT
========================= */
export const getCategoriesByParent = async (req, res) => {
  try {
    const { parentCategory } = req.params;
    const userId = req.user.userId;
    const cacheKey = `categories:parent:${parentCategory}:${userId}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const categories = await Category.find({ userId, parentCategory });

    setCache(cacheKey, categories);
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   GET CATEGORY BY NAME
========================= */
export const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.params;
    const userId = req.user.userId;
    const cacheKey = `categories:name:${name}:${userId}`;

    const cached = getCache(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }

    const category = await Category.findOne({ userId, name });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    setCache(cacheKey, category);
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
