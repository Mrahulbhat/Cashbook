import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const generateToken = (userId, phone) => {
    return jwt.sign({ userId, phone }, JWT_SECRET, {
        expiresIn: '7d',
    });
};

export const verifyToken = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
};
