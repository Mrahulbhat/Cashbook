import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  try {
    // Get token from header or cookies
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Please log in.",
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export const generateToken = (userId, email) => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || "your_jwt_secret",
    { expiresIn: "7d" }
  );
};
