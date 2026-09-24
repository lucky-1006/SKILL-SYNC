import express from 'express';
import cors from 'cors';
import { configService, config } from './config';
import { authRouter } from './modules/auth/auth.router';
import { skillsRouter } from './modules/skills/skills.router';
import { careerRouter } from './modules/career/career.router';
import { opportunitiesRouter } from './modules/opportunities/opportunities.router';
import { lifecycleRouter } from './modules/lifecycle/lifecycle.router';
import { academiciansRouter } from './modules/academicians/academicians.router';
import { industryRouter } from './modules/industry/industry.router';
import { institutionRouter } from './modules/institution/institution.router';
import { portfolioRouter } from './modules/portfolio/portfolio.router';
import { collaborationRouter } from './modules/collaboration/collaboration.router';
import { aiRouter } from './modules/ai/ai.router';
import { notificationsRouter } from './modules/notifications/notifications.router';

const app = express();
const PORT = config.app.port;
const prefix = config.app.apiPrefix.startsWith('/') ? config.app.apiPrefix : `/${config.app.apiPrefix}`;

// CORS Configuration
const allowedOrigin = config.app.corsOrigin;
app.use(
  cors({
    origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(',').map((o) => o.trim()),
    credentials: true
  })
);
app.use(express.json());

// API Routes
app.use(`${prefix}/auth`, authRouter);
app.use(prefix, skillsRouter);
app.use(prefix, careerRouter);
app.use(prefix, opportunitiesRouter);
app.use(prefix, lifecycleRouter);
app.use(prefix, academiciansRouter);
app.use(prefix, industryRouter);
app.use(prefix, institutionRouter);
app.use(prefix, portfolioRouter);
app.use(prefix, collaborationRouter);
app.use(prefix, aiRouter);
app.use(prefix, notificationsRouter);

// Health Check & System Status
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    service: 'SkillSync Core API Engine',
    version: '1.0.0',
    sihProblemStatement: '26044',
    ministry: 'Ministry of Ayush / All India Institute of Ayurveda',
    environment: config.app.nodeEnv,
    activeAIProvider: config.ai.provider,
    activeLLMModel: config.ai.llmModel,
    timestamp: new Date().toISOString()
  });
});

// Sanitized Public Config Endpoint (Masks all secrets and passwords)
app.get(`${prefix}/system/config`, (_req, res) => {
  res.json(configService.getSanitizedConfig());
});

import { OpportunitySyncService } from './modules/opportunities/services/opportunity-sync.service';

app.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 SkillSync Core Backend Server running on http://localhost:${PORT}`);
  console.log(`📡 API Prefix: ${prefix}`);
  console.log(`🔒 Environment: ${config.app.nodeEnv}`);
  console.log(`🤖 AI Provider: ${config.ai.provider} (${config.ai.llmModel})`);
  console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=============================================================\n`);

  // Initialize Opportunity Sync Scheduler
  OpportunitySyncService.getInstance().startScheduledSync();
});

