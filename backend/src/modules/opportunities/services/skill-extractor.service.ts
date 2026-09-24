import { prisma } from '../../../lib/prisma';

export interface ExtractedSkill {
  skillId?: string;
  skillName: string;
  minScore: number;
  isMandatory: boolean;
}

export class SkillExtractorService {
  private static cachedCanonicalSkills: { id: string; name: string; category: string }[] | null = null;
  private static lastCacheTime = 0;
  private static readonly CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

  // Canonical alias dictionary
  private static readonly ALIAS_MAP: Record<string, string> = {
    'react.js': 'React',
    'reactjs': 'React',
    'react': 'React',
    'python3': 'Python',
    'python': 'Python',
    'py': 'Python',
    'node.js': 'Node.js',
    'nodejs': 'Node.js',
    'node': 'Node.js',
    'typescript': 'TypeScript',
    'ts': 'TypeScript',
    'javascript': 'JavaScript',
    'js': 'JavaScript',
    'postgres': 'PostgreSQL',
    'postgresql': 'PostgreSQL',
    'sql': 'SQL',
    'mysql': 'MySQL',
    'nosql': 'MongoDB',
    'mongodb': 'MongoDB',
    'k8s': 'Kubernetes',
    'kubernetes': 'Kubernetes',
    'docker': 'Docker & Containers',
    'container': 'Docker & Containers',
    'containers': 'Docker & Containers',
    'docker & containers': 'Docker & Containers',
    'git': 'Git & Version Control',
    'github': 'Git & Version Control',
    'version control': 'Git & Version Control',
    'ml': 'Machine Learning',
    'machine learning': 'Machine Learning',
    'deep learning': 'Deep Learning',
    'dl': 'Deep Learning',
    'pytorch': 'PyTorch',
    'torch': 'PyTorch',
    'tensorflow': 'TensorFlow',
    'keras': 'TensorFlow',
    'scikit-learn': 'Scikit-Learn',
    'sklearn': 'Scikit-Learn',
    'fastapi': 'FastAPI',
    'express': 'Express.js',
    'expressjs': 'Express.js',
    'next.js': 'Next.js',
    'nextjs': 'Next.js',
    'aws': 'AWS Cloud',
    'azure': 'Azure Cloud',
    'gcp': 'Google Cloud Platform',
    'nlp': 'Natural Language Processing',
    'computer vision': 'Computer Vision',
    'cv': 'Computer Vision',
    'data structures': 'Data Structures & Algorithms',
    'algorithms': 'Data Structures & Algorithms',
    'dsa': 'Data Structures & Algorithms',
    'ayush': 'Ayush Health Data Standards',
    'ayurveda': 'Ayush Health Data Standards',
    'health informatics': 'Ayush Health Data Standards',
    'clinical data': 'Ayush Health Data Standards',
    'rest api': 'API Design & Integration',
    'apis': 'API Design & Integration',
    'graphql': 'GraphQL'
  };

  /**
   * Load master skills from the database with in-memory caching
   */
  private static async getCanonicalSkills(): Promise<{ id: string; name: string; category: string }[]> {
    const now = Date.now();
    if (this.cachedCanonicalSkills && now - this.lastCacheTime < this.CACHE_TTL_MS) {
      return this.cachedCanonicalSkills;
    }

    try {
      const skills = await prisma.skill.findMany({
        select: { id: true, name: true, category: true }
      });
      this.cachedCanonicalSkills = skills;
      this.lastCacheTime = now;
      return skills;
    } catch (error) {
      console.error('Failed to load canonical skills for extractor:', error);
      return this.cachedCanonicalSkills || [];
    }
  }

  /**
   * Normalize an individual skill name to its canonical form
   */
  public static normalizeSkillName(rawSkill: string): string {
    const clean = rawSkill.toLowerCase().trim();
    if (this.ALIAS_MAP[clean]) {
      return this.ALIAS_MAP[clean];
    }

    // Capitalize words as fallback
    return rawSkill
      .split(' ')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }

  /**
   * Deterministically extract and normalize skills from title, description, and raw skills tags
   */
  public static async extractAndNormalize(
    title: string,
    description: string,
    rawSkills: string[] = []
  ): Promise<{
    requiredSkills: ExtractedSkill[];
    normalizedSkillNames: string[];
  }> {
    const canonicalList = await this.getCanonicalSkills();
    const canonicalMap = new Map<string, { id: string; name: string }>();

    canonicalList.forEach((s) => {
      canonicalMap.set(s.name.toLowerCase().trim(), { id: s.id, name: s.name });
    });

    const corpus = `${title} ${description} ${rawSkills.join(' ')}`.toLowerCase();
    const matchedCanonicalNames = new Set<string>();

    // 1. Check raw skills input first
    rawSkills.forEach((raw) => {
      const norm = this.normalizeSkillName(raw);
      matchedCanonicalNames.add(norm);
    });

    // 2. Check alias dictionary matches in corpus
    for (const [alias, canonical] of Object.entries(this.ALIAS_MAP)) {
      // Word boundary regex check
      const regex = new RegExp(`\\b${alias.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(corpus)) {
        matchedCanonicalNames.add(canonical);
      }
    }

    // 3. Check database canonical skills directly in corpus
    for (const skill of canonicalList) {
      const regex = new RegExp(`\\b${skill.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (regex.test(corpus)) {
        matchedCanonicalNames.add(skill.name);
      }
    }

    // Convert to required skills structure
    const requiredSkills: ExtractedSkill[] = Array.from(matchedCanonicalNames).map((name) => {
      const found = canonicalMap.get(name.toLowerCase().trim());
      // Mandate skills that appear in title or have high demand
      const isMandatory = title.toLowerCase().includes(name.toLowerCase());

      return {
        skillId: found ? found.id : undefined,
        skillName: found ? found.name : name,
        minScore: 60,
        isMandatory
      };
    });

    return {
      requiredSkills,
      normalizedSkillNames: Array.from(matchedCanonicalNames)
    };
  }
}
