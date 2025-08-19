// src/middleware/tokens.middleware.ts
import { NextFunction, Response } from 'express';
import type { Request } from 'express';
import { GraphUser } from '@/model/GraphUser';

export async function requirePositiveTokens(req: Request, res: Response, next: NextFunction) {
    try {
        const id = req.user?.id;
        if (!id) return res.status(401).json({ error: 'Unauthorized' });

        const user = await GraphUser.findByPk(id);
        const tokens = Number(user?.tokens_user ?? 0);
        if (tokens <= 0) {
            return res.status(401).json({ error: 'Unauthorized', message: 'Saldo de tokens agotado' });
        }
        next();
    } catch (e) {
        next(e);
    }
}
