import { Response, Request, NextFunction } from 'express';
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    userId?: number;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")){
        return res.status(401).send("Acess Denied.");
    }
    const token = authHeader.split(' ')[1];
    
    try {
        const secret = process.env.JWT_SECRET || 'fallback_secret';

        const decoded = jwt.verify(token, secret) as { userId: number };
        req.userId = decoded.userId;
        next();
    } catch (error){
        return res.status(401).send("Invalid or expired token.")
    }
}