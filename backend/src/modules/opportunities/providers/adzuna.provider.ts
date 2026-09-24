import { OpportunityProvider, ExternalOpportunityData, ProviderSearchParams } from './opportunity-provider.interface';
import { configService } from '../../../config';

export class AdzunaProvider implements OpportunityProvider {
  public readonly name = 'ADZUNA';
  public readonly supportedType = 'JOB' as const;

  private get appId(): string | undefined {
    return configService.opportunities.providers.adzuna.appId;
  }

  private get appKey(): string | undefined {
    return configService.opportunities.providers.adzuna.appKey;
  }

  private get country(): string {
    return configService.opportunities.providers.adzuna.country || 'in';
  }

  public isConfigured(): boolean {
    return (
      configService.opportunities.providers.adzuna.enabled &&
      Boolean(this.appId && this.appKey)
    );
  }

  public async search(params: ProviderSearchParams): Promise<ExternalOpportunityData[]> {
    if (!this.isConfigured()) {
      console.log('ℹ️ [AdzunaProvider] Provider is disabled or unconfigured. Skipping API request.');
      return [];
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 20, 50);
    const query = encodeURIComponent(params.query || 'software engineer');
    const location = params.location ? `&where=${encodeURIComponent(params.location)}` : '';

    const url = `https://api.adzuna.com/v1/api/jobs/${this.country}/search/${page}?app_id=${this.appId}&app_key=${this.appKey}&results_per_page=${limit}&what=${query}${location}&content-type=application/json`;

    try {
      console.log(`📡 [AdzunaProvider] Fetching real jobs from Adzuna API (${this.country})...`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'SkillSync-SIH2026/1.0'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ [AdzunaProvider] API responded with status ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = (await response.json()) as any;
      const results = data.results || [];


      return results.map((item: any) => this.mapToOpportunityData(item));
    } catch (error) {
      console.error('❌ [AdzunaProvider] Network / API fetch error:', error);
      return [];
    }
  }

  public async fetchDetails(id: string): Promise<ExternalOpportunityData | null> {
    // Adzuna search with specific job ID or search filter
    const results = await this.search({ query: id, limit: 1 });
    return results.find((r) => r.sourceId === id) || results[0] || null;
  }

  private mapToOpportunityData(item: any): ExternalOpportunityData {
    const rawTitle = this.sanitizeText(item.title || 'Untitled Opportunity');
    const rawDescription = this.sanitizeText(item.description || 'No detailed description provided.');
    const companyName = item.company?.display_name || 'Verified Industry Employer';
    const locationName = item.location?.display_name || 'India';
    
    // Detect Remote / Hybrid from title & description
    const textCorpus = `${rawTitle} ${rawDescription}`.toLowerCase();
    const isRemote = textCorpus.includes('remote') || textCorpus.includes('work from home');
    const isHybrid = textCorpus.includes('hybrid');
    const workMode: 'REMOTE' | 'HYBRID' | 'ON_SITE' = isRemote
      ? 'REMOTE'
      : isHybrid
      ? 'HYBRID'
      : 'ON_SITE';

    // Type detection: Internship vs Full-Time Job
    const isInternship =
      textCorpus.includes('intern') ||
      textCorpus.includes('internship') ||
      textCorpus.includes('trainee');
    const type = isInternship ? 'INTERNSHIP' : 'JOB';

    // Salary string formatting
    let stipendOrSalary = 'Competitive as per industry norms';
    const salaryMin = typeof item.salary_min === 'number' ? Math.round(item.salary_min) : undefined;
    const salaryMax = typeof item.salary_max === 'number' ? Math.round(item.salary_max) : undefined;

    if (salaryMin && salaryMax) {
      stipendOrSalary = `₹${salaryMin.toLocaleString('en-IN')} - ₹${salaryMax.toLocaleString('en-IN')} / year`;
    } else if (salaryMin) {
      stipendOrSalary = `₹${salaryMin.toLocaleString('en-IN')} / year (Base)`;
    }

    // Published date & 45-day deadline fallback
    const publishedAt = item.created ? new Date(item.created) : new Date();
    const deadlineDate = new Date(publishedAt.getTime() + 45 * 24 * 60 * 60 * 1000);
    const deadline = deadlineDate.toISOString().split('T')[0];

    // Safe redirect URL
    const safeUrl = this.validateUrl(item.redirect_url) || 'https://www.adzuna.in';

    return {
      sourceId: String(item.id || `adzuna-${Date.now()}`),
      source: 'ADZUNA',
      sourceType: 'EXTERNAL',
      title: rawTitle,
      companyName,
      companyLogo: undefined,
      type,
      description: rawDescription,
      location: locationName,
      country: this.country === 'in' ? 'India' : this.country.toUpperCase(),
      remote: isRemote,
      hybrid: isHybrid,
      workMode,
      employmentType: item.contract_type ? item.contract_type.toUpperCase() : 'FULL_TIME',
      stipendOrSalary,
      salaryMin,
      salaryMax,
      currency: 'INR',
      duration: isInternship ? '6 Months' : 'Permanent',
      openings: 2,
      deadline,
      expiresAt: deadlineDate,
      applicationUrl: safeUrl,
      sourceUrl: safeUrl,
      rawSkills: [],
      category: item.category?.label || 'Information Technology',
      publishedAt,
      metadata: {
        adzunaCategory: item.category?.tag,
        latitude: item.latitude,
        longitude: item.longitude
      }
    };
  }

  private sanitizeText(text: string): string {
    return text
      .replace(/<[^>]*>/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
  }

  private validateUrl(url?: string): string | null {
    if (!url) return null;
    try {
      const parsed = new URL(url);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
      return null;
    } catch {
      return null;
    }
  }
}
