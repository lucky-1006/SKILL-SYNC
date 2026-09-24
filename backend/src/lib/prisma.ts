import { PrismaClient } from '@prisma/client';
import { configService } from '../config';

const dbUrl = configService.get<string>('database.url');

export const prisma = new PrismaClient({
  datasources: dbUrl ? { db: { url: dbUrl } } : undefined
});
