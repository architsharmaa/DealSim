import type { Request, Response } from 'express';
interface AuthRequest extends Request {
    userId?: string;
}
export declare const getMe: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=userController.d.ts.map