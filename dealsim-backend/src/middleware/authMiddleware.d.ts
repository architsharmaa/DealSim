import type { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    userId?: string;
    organizationId?: string;
    role?: string;
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const adminOnly: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=authMiddleware.d.ts.map