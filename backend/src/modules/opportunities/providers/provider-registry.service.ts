import { OpportunityProvider, ProviderStatus } from './opportunity-provider.interface';
import { AdzunaProvider } from './adzuna.provider';
import { UdemyProvider } from './udemy.provider';
import { prisma } from '../../../lib/prisma';
import { configService } from '../../../config';

export class ProviderRegistryService {
  private static instance: ProviderRegistryService;
  private providers: Map<string, OpportunityProvider> = new Map();

  private constructor() {
    this.registerProvider(new AdzunaProvider());
    this.registerProvider(new UdemyProvider());
  }

  public static getInstance(): ProviderRegistryService {
    if (!ProviderRegistryService.instance) {
      ProviderRegistryService.instance = new ProviderRegistryService();
    }
    return ProviderRegistryService.instance;
  }

  public registerProvider(provider: OpportunityProvider): void {
    this.providers.set(provider.name.toUpperCase(), provider);
  }

  public getProvider(name: string): OpportunityProvider | undefined {
    return this.providers.get(name.toUpperCase());
  }

  public getAllProviders(): OpportunityProvider[] {
    return Array.from(this.providers.values());
  }

  public getActiveProviders(): OpportunityProvider[] {
    return this.getAllProviders().filter((p) => p.isConfigured());
  }

  public async getProviderStatuses(): Promise<ProviderStatus[]> {
    const statuses: ProviderStatus[] = [];

    for (const provider of this.providers.values()) {
      const isConfigured = provider.isConfigured();
      let enabled = false;

      if (provider.name === 'ADZUNA') {
        enabled = configService.opportunities.providers.adzuna.enabled;
      } else if (provider.name === 'UDEMY') {
        enabled = configService.opportunities.providers.udemy.enabled;
      }

      // Query latest sync log
      const latestLog = await prisma.opportunitySyncLog.findFirst({
        where: { providerName: provider.name },
        orderBy: { startedAt: 'desc' }
      });

      // Count existing opportunities for this provider
      const recordsCount = await prisma.opportunity.count({
        where: { source: provider.name }
      });

      statuses.push({
        name: provider.name,
        type: provider.supportedType,
        enabled,
        configured: isConfigured,
        lastSyncAt: latestLog ? latestLog.startedAt.toISOString() : undefined,
        lastSyncStatus: latestLog ? latestLog.status : 'NEVER_RUN',
        recordsCount
      });
    }

    // Add native portal summary
    const nativeCount = await prisma.opportunity.count({
      where: { sourceType: 'NATIVE' }
    });

    statuses.unshift({
      name: 'SKILLSYNC_NATIVE',
      type: 'ALL',
      enabled: true,
      configured: true,
      lastSyncAt: new Date().toISOString(),
      lastSyncStatus: 'ONLINE',
      recordsCount: nativeCount
    });

    return statuses;
  }
}
