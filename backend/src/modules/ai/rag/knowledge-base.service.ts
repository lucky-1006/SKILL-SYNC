export interface KnowledgeDocument {
  id: string;
  category:
    | 'AYUSH_STANDARDS'
    | 'CAREER_BENCHMARKS'
    | 'INTERNSHIP_POLICY'
    | 'CURRICULUM_GUIDELINE'
    | 'LIVE_OPPORTUNITY';
  title: string;
  content: string;
  keywords: string[];
}


export class KnowledgeBaseService {
  private static documents: KnowledgeDocument[] = [
    {
      id: 'kb-1',
      category: 'AYUSH_STANDARDS',
      title: 'Ayush National NAMASTE EHR Terminology Interoperability Guideline',
      content:
        'The Ministry of Ayush specifies standardized EHR terminologies (NAMASTE portal and ICD-11 module 2) for documenting traditional formulations, botanical provenance, and clinical diagnoses. All data pipelines handling Ayurvedic electronic medical records must validate against standardized ontology codes before training predictive AI classifiers.',
      keywords: ['ayush', 'namaste', 'ehr', 'interoperability', 'botanical', 'ayurveda', 'standards']
    },
    {
      id: 'kb-2',
      category: 'CAREER_BENCHMARKS',
      title: 'AI & Machine Learning Engineer Industry Hiring Prerequisites',
      content:
        'Industry benchmark for entry-level AI & Machine Learning Engineers requires proficiency in Python (>=80%), Scikit-Learn/PyTorch (>=75%), SQL relational querying (>=70%), and containerized deployment with Docker (>=60%). Experience deploying low-latency FastAPI endpoints and tracking experiment runs with MLflow is highly prioritized.',
      keywords: ['ai engineer', 'machine learning', 'python', 'pytorch', 'docker', 'sql', 'benchmark']
    },
    {
      id: 'kb-3',
      category: 'INTERNSHIP_POLICY',
      title: 'AICTE / UGC Mandatory 6-Month Industry Internship Guidelines',
      content:
        'Under AICTE guidelines, engineering and technology students in semester 7 or 8 are eligible for full-semester industrial internships. Mentors must evaluate weekly progress reports and assign graded milestones. Satisfactory completion grants 12 to 16 academic credits and an institutionally signed digital certificate.',
      keywords: ['aicte', 'internship', 'credits', 'weekly report', 'mentor', 'attendance', 'policy']
    },
    {
      id: 'kb-4',
      category: 'CAREER_BENCHMARKS',
      title: 'Ayurvedic Health Informatics Specialist Competencies',
      content:
        'Ayurvedic Health Informatics specialists bridge classical Sanskrit pharmacopoeia with modern molecular databases (PubChem, ChEMBL). Required skills include relational database management, knowledge graph extraction via NLP transformers, and clinical biostatistics.',
      keywords: ['health informatics', 'ayurveda', 'knowledge graph', 'pubchem', 'biostatistics']
    },
    {
      id: 'kb-5',
      category: 'CURRICULUM_GUIDELINE',
      title: 'Addressing Curricular Skill Gaps in Engineering & Biomedical Institutions',
      content:
        'The nationwide assessment reveals that while students excel in algorithmic theory, the greatest industry shortages lie in Cloud Deployment/Docker (38% gap), Enterprise Soft Skills (42% gap), and Data Engineering. Bridging these through hands-on laboratory modules significantly accelerates campus placement.',
      keywords: ['skill gap', 'cloud', 'docker', 'communication', 'curriculum', 'placement']
    }
  ];

  public static getDocuments(): KnowledgeDocument[] {
    return this.documents;
  }

  public static searchByKeywords(query: string, topK: number = 3): KnowledgeDocument[] {
    const qLower = query.toLowerCase();
    const scored = this.documents.map((doc) => {
      let score = 0;
      doc.keywords.forEach((kw) => {
        if (qLower.includes(kw)) score += 2;
      });
      if (doc.content.toLowerCase().includes(qLower)) score += 3;
      return { doc, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, topK).map((s) => s.doc);
  }
}
