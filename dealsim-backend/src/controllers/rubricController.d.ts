import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
export declare const createRubric: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getRubrics: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=rubricController.d.ts.map