import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    type:{
        type: String, //income or expense
        required: true
    },
    parentCategory: {
      type: String,
      required: true
    },
    budget: {
      type: String,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;