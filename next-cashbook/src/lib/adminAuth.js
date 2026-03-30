import jwt from 'jsonwebtoken';

const ADMIN_SECRET = process.env.ADMIN_JWT_SECRET || 'cashbook_admin_super_secret_2024';

export const generateAdminToken = () => {
    return jwt.sign({ role: 'admin' }, ADMIN_SECRET, { expiresIn: '4h' });
};

export const verifyAdminToken = (token) => {
    try {
        return jwt.verify(token, ADMIN_SECRET);
    } catch {
        return null;
    }
};
