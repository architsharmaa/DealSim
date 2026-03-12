import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../middleware/authMiddleware.js';
export declare const createPersona: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getPersonas: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=personaController.d.ts.map