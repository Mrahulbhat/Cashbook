import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: String,
    phone: {
      type: Number,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      select: false 
    },
    googleId: {
      type: String
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function () {
  // Skip if password is not modified or doesn't exist (e.g., Google OAuth)
  if (!this.isModified("password") || !this.password) {
    return;
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
