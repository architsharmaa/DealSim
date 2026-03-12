import Context from '../models/Context.js';
export const createContext = async (req, res, next) => {
    try {
        const context = new Context({
            ...req.body,
            organizationId: req.organizationId
        });
        await context.save();
        res.status(201).json(context);
    }
    catch (error) {
        next(error);
    }
};
export const getContexts = async (req, res, next) => {
    try {
        if (!req.organizationId) {
            return res.status(401).json({ message: 'Organization ID not found in token' });
        }
        const contexts = await Context.find({ organizationId: req.organizationId });
        res.json(contexts);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=contextController.js.map