import { OpportunityProvider, ExternalOpportunityData, ProviderSearchParams } from './opportunity-provider.interface';
import { configService } from '../../../config';

export class UdemyProvider implements OpportunityProvider {
  public readonly name = 'UDEMY';
  public readonly supportedType = 'COURSE' as const;

  private get clientId(): string | undefined {
    return configService.opportunities.providers.udemy.clientId;
  }

  private get clientSecret(): string | undefined {
    return configService.opportunities.providers.udemy.clientSecret;
  }

  public isConfigured(): boolean {
    return (
      configService.opportunities.providers.udemy.enabled &&
      Boolean(this.clientId && this.clientSecret)
    );
  }

  public async search(params: ProviderSearchParams): Promise<ExternalOpportunityData[]> {
    if (!this.isConfigured()) {
      console.log('ℹ️ [UdemyProvider] Provider is disabled or unconfigured. Skipping API request.');
      return [];
    }

    const page = params.page || 1;
    const limit = Math.min(params.limit || 15, 30);
    const search = encodeURIComponent(params.query || 'Computer Science');

    const url = `https://www.udemy.com/api-2.0/courses/?page=${page}&page_size=${limit}&search=${search}&ordering=relevance`;
    const basicAuth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');

    try {
      console.log(`📡 [UdemyProvider] Fetching real learning courses from Udemy API...`);
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Authorization': `Basic ${basicAuth}`,
          'User-Agent': 'SkillSync-SIH2026/1.0'
        }
      });

      if (!response.ok) {
        console.warn(`⚠️ [UdemyProvider] API returned status ${response.status}: ${response.statusText}`);
        return [];
      }

      const data = (await response.json()) as any;
      const results = data.results || [];


      return results.map((item: any) => this.mapToOpportunityData(item));
    } catch (error) {
      console.error('❌ [UdemyProvider] API request error:', error);
      return [];
    }
  }

  public async fetchDetails(id: string): Promise<ExternalOpportunityData | null> {
    const results = await this.search({ query: id, limit: 1 });
    return results[0] || null;
  }

  private mapToOpportunityData(item: any): ExternalOpportunityData {
    const title = item.title || 'Technical Skill Course';
    const headline = item.headline || 'Comprehensive course on industry concepts and tools.';
    const courseUrl = item.url ? `https://www.udemy.com${item.url}` : 'https://www.udemy.com';
    const instructor = item.visible_instructors?.[0]?.display_name || 'Udemy Certified Instructor';

    const deadlineDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

    return {
      sourceId: String(item.id || `udemy-${Date.now()}`),
      source: 'UDEMY',
      sourceType: 'EXTERNAL',
      title,
      companyName: `Udemy • ${instructor}`,
      companyLogo: item.image_125_H || item.image_480x270,
      type: 'COURSE',
      description: `${headline}\n\nInstructor: ${instructor}. Online self-paced learning module with certificate of completion upon finishing.`,
      location: 'Online / Self-Paced',
      country: 'Global',
      remote: true,
      hybrid: false,
      workMode: 'REMOTE',
      employmentType: 'ONLINE_COURSE',
      stipendOrSalary: 'Free / Subsidized Institutional Access',
      duration: '4-8 Weeks',
      openings: 50,
      deadline: deadlineDate.toISOString().split('T')[0],
      expiresAt: deadlineDate,
      applicationUrl: courseUrl,
      sourceUrl: courseUrl,
      rawSkills: [title],
      category: 'CONTINUING_EDUCATION',
      publishedAt: new Date(),
      metadata: {
        instructor,
        image: item.image_480x270
      }
    };
  }
}
