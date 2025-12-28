import Category from "../models/category.model.js";

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by ID
export const getCategoryData = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    
    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Add new category
export const addCategory = async (req, res) => {
  try {
    const { name, type, parentCategory, budget } = req.body;

    // Validate required fields
    if (!name || !type || !parentCategory) {
      return res.status(400).json({ message: "Missing required fields: name, type, parentCategory" });
    }

    // Validate type is either "income" or "expense"
    if (!["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    // Check if category with same name already exists
    const existingCategory = await Category.findOne({ name });
    if (existingCategory) {
      return res.status(400).json({ message: "Category with this name already exists" });
    }

    // Create category
    const category = new Category({
      name,
      type: type.toLowerCase(),
      parentCategory,
      budget,
    });

    // Save category
    const savedCategory = await category.save();
    res.status(201).json(savedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, parentCategory, budget } = req.body;

    // Find the existing category
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // If name is being updated, check for duplicates
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ name });
      if (existingCategory) {
        return res.status(400).json({ message: "Category with this name already exists" });
      }
    }

    // Validate type if provided
    if (type && !["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    // Update category fields
    category.name = name || category.name;
    category.type = type ? type.toLowerCase() : category.type;
    category.parentCategory = parentCategory || category.parentCategory;
    category.budget = budget !== undefined ? budget : category.budget;

    const updatedCategory = await category.save();
    res.status(200).json(updatedCategory);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    await Category.findByIdAndDelete(id);
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get categories by type (income or expense)
export const getCategoriesByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!["income", "expense"].includes(type.toLowerCase())) {
      return res.status(400).json({ message: "Type must be 'income' or 'expense'" });
    }

    const categories = await Category.find({ type: type.toLowerCase() });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get categories by parent category
export const getCategoriesByParent = async (req, res) => {
  try {
    const { parentCategory } = req.params;

    const categories = await Category.find({ parentCategory });
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get category by name
export const getCategoryByName = async (req, res) => {
  try {
    const { name } = req.params;

    const category = await Category.findOne({ name });
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
