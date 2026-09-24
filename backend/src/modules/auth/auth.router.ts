import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../../lib/prisma';
import { UserRole } from '@skillsync/shared';
import { configService } from '../../config';

export const authRouter = Router();
const getJwtSecret = () => configService.get<string>('auth.jwtSecret');
const getJwtExpiresIn = () => configService.get<string>('auth.jwtExpiresIn') || '7d';

// 1. Regular Login
authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        studentProfile: true,
        academicianProfile: true
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentProfileId: user.studentProfile?.id,
        academicianProfileId: user.academicianProfile?.id
      },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() as any }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        studentProfileId: user.studentProfile?.id,
        academicianProfileId: user.academicianProfile?.id
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 2. Instant Demo Switcher for SIH Evaluation (One-click role switch)
authRouter.post('/demo-switch', async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    let targetEmail = 'student@skillsync.edu';

    if (role === UserRole.ACADEMICIAN) {
      targetEmail = 'faculty@aiia.gov.in';
    } else if (role === UserRole.INDUSTRY) {
      targetEmail = 'recruiter@tcshealth.com';
    } else if (role === UserRole.INSTITUTION) {
      targetEmail = 'dean@aiia.gov.in';
    } else if (role === UserRole.ADMIN) {
      targetEmail = 'admin@skillsync.gov.in';
    }

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        studentProfile: true,
        academicianProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: `Demo account for ${role} not found` });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        studentProfileId: user.studentProfile?.id,
        academicianProfileId: user.academicianProfile?.id
      },
      getJwtSecret(),
      { expiresIn: getJwtExpiresIn() as any }
    );

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: user.avatarUrl,
        studentProfileId: user.studentProfile?.id,
        academicianProfileId: user.academicianProfile?.id
      }
    });
  } catch (error) {
    console.error('Demo switch error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. Current User
authRouter.get('/me', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, getJwtSecret()) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        studentProfile: true,
        academicianProfile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatarUrl: user.avatarUrl,
      studentProfile: user.studentProfile,
      academicianProfile: user.academicianProfile
    });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
});
