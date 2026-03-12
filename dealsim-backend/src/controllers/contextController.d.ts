import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
export declare const createContext: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getContexts: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=contextController.d.ts.map