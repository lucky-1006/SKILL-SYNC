import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { configService } from '../config';

const getJwtSecret = () => configService.get<string>('auth.jwtSecret');

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: string;
  studentProfileId?: string;
  academicianProfileId?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Default fallback to student user for easy testing if no token provided
    req.user = {
      id: 'student-default',
      email: 'student@skillsync.edu',
      name: 'Swastik Singh',
      role: 'STUDENT'
    };
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};
