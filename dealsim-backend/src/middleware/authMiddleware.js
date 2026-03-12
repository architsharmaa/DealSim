import jwt from 'jsonwebtoken';
export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_key');
        req.userId = decoded.userId;
        req.organizationId = decoded.organizationId;
        req.role = decoded.role;
        next();
    }
    catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};
export const adminOnly = (req, res, next) => {
    if (req.role !== 'organization_admin' && req.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
    next();
};
//# sourceMappingURL=authMiddleware.js.map