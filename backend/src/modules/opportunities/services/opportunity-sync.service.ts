import { prisma } from '../../../lib/prisma';
import { ProviderRegistryService } from '../providers/provider-registry.service';
import { SkillExtractorService } from './skill-extractor.service';
import { ExternalOpportunityData } from '../providers/opportunity-provider.interface';
import { configService } from '../../../config';

export interface SyncExecutionReport {
  provider: string;
  status: 'SUCCESS' | 'FAILED' | 'SKIPPED';
  recordsFetched: number;
  recordsImported: number;
  recordsUpdated: number;
  recordsExpired: number;
  durationMs: number;
  error?: string;
}

export class OpportunitySyncService {
  private static instance: OpportunitySyncService;
  private syncTimer: NodeJS.Timeout | null = null;
  private isSyncing = false;

  private constructor() {}

  public static getInstance(): OpportunitySyncService {
    if (!OpportunitySyncService.instance) {
      OpportunitySyncService.instance = new OpportunitySyncService();
    }
    return OpportunitySyncService.instance;
  }

  /**
   * Start scheduled background sync timer if enabled in configuration
   */
  public startScheduledSync(): void {
    const syncConfig = configService.opportunities.providers.sync;
    if (!syncConfig.enabled) {
      console.log('ℹ️ [OpportunitySyncService] Background sync is disabled by configuration.');
      return;
    }

    const intervalMs = Math.max(syncConfig.intervalMinutes, 15) * 60 * 1000;
    console.log(
      `⏱️ [OpportunitySyncService] Starting sync scheduler (Interval: ${syncConfig.intervalMinutes}m)`
    );

    // Initial sync run after 15 seconds of boot
    setTimeout(() => {
      this.syncAllProviders().catch((err) =>
        console.error('Initial opportunity sync error:', err)
      );
    }, 15000);

    // Recurring schedule
    this.syncTimer = setInterval(() => {
      this.syncAllProviders().catch((err) =>
        console.error('Scheduled opportunity sync error:', err)
      );
    }, intervalMs);
  }

  public stopScheduledSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Synchronize all registered active external providers
   */
  public async syncAllProviders(): Promise<SyncExecutionReport[]> {
    if (this.isSyncing) {
      console.log('⚠️ [OpportunitySyncService] A synchronization cycle is already running. Skipping.');
      return [];
    }

    this.isSyncing = true;
    const reports: SyncExecutionReport[] = [];

    try {
      // 1. Process expiration of past opportunities first
      const expiredCount = await this.expireOutdatedOpportunities();

      const registry = ProviderRegistryService.getInstance();
      const providers = registry.getAllProviders();

      for (const provider of providers) {
        if (!provider.isConfigured()) {
          reports.push({
            provider: provider.name,
            status: 'SKIPPED',
            recordsFetched: 0,
            recordsImported: 0,
            recordsUpdated: 0,
            recordsExpired: expiredCount,
            durationMs: 0
          });
          continue;
        }

        const report = await this.syncSingleProvider(provider.name);
        report.recordsExpired = expiredCount;
        reports.push(report);
      }
    } finally {
      this.isSyncing = false;
    }

    return reports;
  }

  /**
   * Synchronize a specific provider on demand
   */
  public async syncSingleProvider(providerName: string): Promise<SyncExecutionReport> {
    const startTime = Date.now();
    const registry = ProviderRegistryService.getInstance();
    const provider = registry.getProvider(providerName);

    if (!provider) {
      return {
        provider: providerName,
        status: 'FAILED',
        recordsFetched: 0,
        recordsImported: 0,
        recordsUpdated: 0,
        recordsExpired: 0,
        durationMs: 0,
        error: `Provider "${providerName}" is not registered.`
      };
    }

    if (!provider.isConfigured()) {
      return {
        provider: providerName,
        status: 'SKIPPED',
        recordsFetched: 0,
        recordsImported: 0,
        recordsUpdated: 0,
        recordsExpired: 0,
        durationMs: 0,
        error: `Provider "${providerName}" credentials are not configured.`
      };
    }

    console.log(`\n=============================================================`);
    console.log(`🔄 [OpportunitySyncService] Starting sync for ${provider.name}...`);
    console.log(`=============================================================`);

    let recordsFetched = 0;
    let recordsImported = 0;
    let recordsUpdated = 0;
    let errorMessage: string | undefined;

    try {
      // 1. Fetch search batch from external provider
      const opportunities = await provider.search({
        query: provider.supportedType === 'COURSE' ? 'Artificial Intelligence Data Science' : 'Software Engineering AI',
        limit: 25
      });

      recordsFetched = opportunities.length;

      // 2. Normalize, extract canonical skills, deduplicate, and upsert
      for (const oppData of opportunities) {
        const result = await this.processExternalOpportunity(oppData);
        if (result === 'IMPORTED') recordsImported++;
        else if (result === 'UPDATED') recordsUpdated++;
      }

      console.log(
        `✅ [OpportunitySyncService] ${provider.name} Sync Finished: ${recordsImported} imported, ${recordsUpdated} updated.`
      );
    } catch (err: any) {
      errorMessage = err.message || 'Unknown provider synchronization error';
      console.error(`❌ [OpportunitySyncService] Sync failure for ${provider.name}:`, err);
    }

    const durationMs = Date.now() - startTime;
    const status = errorMessage ? 'FAILED' : 'SUCCESS';

    // 3. Record sync log in database
    await prisma.opportunitySyncLog.create({
      data: {
        providerName: provider.name,
        status,
        recordsFetched,
        recordsImported,
        recordsUpdated,
        recordsExpired: 0,
        errorMessage,
        durationMs,
        startedAt: new Date(startTime),
        completedAt: new Date()
      }
    });

    return {
      provider: provider.name,
      status,
      recordsFetched,
      recordsImported,
      recordsUpdated,
      recordsExpired: 0,
      durationMs,
      error: errorMessage
    };
  }

  /**
   * Process a single external opportunity: validate, deduplicate, and upsert
   */
  public async processExternalOpportunity(
    oppData: ExternalOpportunityData
  ): Promise<'IMPORTED' | 'UPDATED' | 'SKIPPED'> {
    // 1. Primary deduplication check: source + sourceId
    let existing = await prisma.opportunity.findFirst({
      where: {
        source: oppData.source,
        sourceId: oppData.sourceId
      }
    });

    // 2. Fallback fuzzy deduplication check: normalized title + companyName + location
    if (!existing) {
      const cleanTitle = oppData.title.toLowerCase().trim();
      const cleanCompany = oppData.companyName.toLowerCase().trim();

      existing = await prisma.opportunity.findFirst({
        where: {
          companyName: { contains: cleanCompany },
          title: { contains: cleanTitle }
        }
      });
    }

    // 3. Extract and normalize skills
    const { requiredSkills, normalizedSkillNames } = await SkillExtractorService.extractAndNormalize(
      oppData.title,
      oppData.description,
      oppData.rawSkills
    );

    const requiredSkillsJson = JSON.stringify(requiredSkills);
    const normalizedSkillsJson = JSON.stringify(normalizedSkillNames);
    const eligibleBranches = JSON.stringify(['Computer Science & Engineering', 'Information Technology', 'All Disciplines']);
    const eligibleYears = JSON.stringify([2, 3, 4]);

    if (existing) {
      // Update existing record
      await prisma.opportunity.update({
        where: { id: existing.id },
        data: {
          title: oppData.title,
          description: oppData.description,
          location: oppData.location,
          country: oppData.country || 'India',
          remote: oppData.remote,
          hybrid: oppData.hybrid,
          workMode: oppData.workMode,
          stipendOrSalary: oppData.stipendOrSalary,
          salaryMin: oppData.salaryMin,
          salaryMax: oppData.salaryMax,
          applicationUrl: oppData.applicationUrl,
          sourceUrl: oppData.sourceUrl,
          deadline: oppData.deadline || existing.deadline,
          expiresAt: oppData.expiresAt,
          requiredSkillsJson,
          normalizedSkillsJson,
          lastSyncedAt: new Date(),
          status: 'ACTIVE'
        }
      });
      return 'UPDATED';
    } else {
      // Create new external record
      await prisma.opportunity.create({
        data: {
          title: oppData.title,
          type: oppData.type,
          sourceType: 'EXTERNAL',
          source: oppData.source,
          sourceId: oppData.sourceId,
          sourceUrl: oppData.sourceUrl,
          applicationUrl: oppData.applicationUrl,
          companyId: `ext-${oppData.source.toLowerCase()}`,
          companyName: oppData.companyName,
          companyLogo: oppData.companyLogo,
          location: oppData.location,
          country: oppData.country || 'India',
          remote: oppData.remote,
          hybrid: oppData.hybrid,
          workMode: oppData.workMode,
          employmentType: oppData.employmentType,
          description: oppData.description,
          stipendOrSalary: oppData.stipendOrSalary,
          salaryMin: oppData.salaryMin,
          salaryMax: oppData.salaryMax,
          currency: oppData.currency || 'INR',
          duration: oppData.duration,
          openings: oppData.openings,
          eligibleBranches,
          eligibleYears,
          minCgpa: 6.0,
          deadline: oppData.deadline || new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          expiresAt: oppData.expiresAt,
          requiredSkillsJson,
          normalizedSkillsJson,
          category: oppData.category || 'Information Technology',
          status: 'ACTIVE',
          approvalStatus: 'APPROVED',
          lastSyncedAt: new Date(),
          metadataJson: oppData.metadata ? JSON.stringify(oppData.metadata) : null
        }
      });
      return 'IMPORTED';
    }
  }

  /**
   * Mark opportunities with expired deadlines as EXPIRED
   */
  public async expireOutdatedOpportunities(): Promise<number> {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    try {
      const result = await prisma.opportunity.updateMany({
        where: {
          status: 'ACTIVE',
          OR: [
            { expiresAt: { lt: now } },
            { deadline: { lt: todayStr } }
          ]
        },
        data: {
          status: 'EXPIRED'
        }
      });

      if (result.count > 0) {
        console.log(`🧹 [OpportunitySyncService] Marked ${result.count} past opportunities as EXPIRED.`);
      }

      return result.count;
    } catch (error) {
      console.error('Failed to expire outdated opportunities:', error);
      return 0;
    }
  }
}
