import Rubric from '../models/Rubric.js';
export const createRubric = async (req, res, next) => {
    try {
        const rubric = new Rubric({
            ...req.body,
            organizationId: req.organizationId
        });
        await rubric.save();
        res.status(201).json(rubric);
    }
    catch (error) {
        next(error);
    }
};
export const getRubrics = async (req, res, next) => {
    try {
        if (!req.organizationId) {
            return res.status(401).json({ message: 'Organization ID not found in token' });
        }
        const rubrics = await Rubric.find({ organizationId: req.organizationId });
        res.json(rubrics);
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=rubricController.js.map