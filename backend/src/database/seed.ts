import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SkillSync Master Database Seeding...');

  // 1. Clean existing data
  await prisma.notification.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.internshipTask.deleteMany();
  await prisma.internshipWorkspace.deleteMany();
  await prisma.application.deleteMany();
  await prisma.savedOpportunity.deleteMany();
  await prisma.opportunitySyncLog.deleteMany();
  await prisma.opportunity.deleteMany();
  await prisma.assessmentAttempt.deleteMany();
  await prisma.question.deleteMany();
  await prisma.assessment.deleteMany();
  await prisma.studentProject.deleteMany();
  await prisma.verifiedCertificate.deleteMany();
  await prisma.studentSkillScore.deleteMany();
  await prisma.skill.deleteMany();
  await prisma.careerRole.deleteMany();
  await prisma.mentorshipSlot.deleteMany();
  await prisma.innovationChallenge.deleteMany();
  await prisma.researchProposal.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.academicianProfile.deleteMany();
  await prisma.institutionalSyncLog.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 2. Create Core Stakeholder Users
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@skillsync.edu',
      passwordHash,
      name: 'Swastik Singh',
      role: 'STUDENT',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      studentProfile: {
        create: {
          institutionName: 'All India Institute of Ayurveda & Technology',
          branch: 'Computer Science & Engineering',
          currentYear: 3,
          cgpa: 8.7,
          headline: 'AI & Health-Informatics Enthusiast | 3rd Year CSE',
          bio: 'Passionate about integrating Machine Learning with biomedical and traditional health datasets for predictive diagnostics.',
          readinessScore: 76.5
        }
      }
    },
    include: { studentProfile: true }
  });

  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@aiia.gov.in',
      passwordHash,
      name: 'Dr. Priya Nambiar',
      role: 'ACADEMICIAN',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      academicianProfile: {
        create: {
          institutionName: 'All India Institute of Ayurveda',
          department: 'Dravyaguna & Computational Pharmacology',
          designation: 'Associate Professor & Research Lead',
          specializations: 'Bio-informatics, Herbal Formulation Data, AI in Drug Repurposing',
          yearsExperience: 14,
          publicationsCount: 22,
          patentsCount: 3,
          bio: 'Leading interdisciplinary research at the intersection of classical Ayurveda pharmacognosy and computational deep learning.'
        }
      }
    }
  });

  const industryUser = await prisma.user.create({
    data: {
      email: 'recruiter@tcshealth.com',
      passwordHash,
      name: 'Rajesh Menon',
      role: 'INDUSTRY',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      industryId: 'tcs-bio-it'
    }
  });

  const institutionUser = await prisma.user.create({
    data: {
      email: 'dean@aiia.gov.in',
      passwordHash,
      name: 'Dr. Vikram Malhotra',
      role: 'INSTITUTION',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      institutionId: 'aiia-delhi'
    }
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@skillsync.gov.in',
      passwordHash,
      name: 'SkillSync Super Admin',
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150'
    }
  });

  const studentProfileId = studentUser.studentProfile!.id;

  // 3. Create Skills Master Taxonomy
  const skillsData = [
    { name: 'Python', category: 'PROGRAMMING', inDemandScore: 95 },
    { name: 'Machine Learning', category: 'AI_ML', inDemandScore: 92 },
    { name: 'SQL', category: 'DATA_SCIENCE', inDemandScore: 88 },
    { name: 'Deep Learning', category: 'AI_ML', inDemandScore: 86 },
    { name: 'Statistics & Probability', category: 'DATA_SCIENCE', inDemandScore: 84 },
    { name: 'Natural Language Processing', category: 'AI_ML', inDemandScore: 89 },
    { name: 'Docker & Containers', category: 'CLOUD_DEVOPS', inDemandScore: 81 },
    { name: 'Git & Version Control', category: 'PROGRAMMING', inDemandScore: 90 },
    { name: 'Ayush Health Data Standards', category: 'AYUSH_HEALTH_TECH', inDemandScore: 78 },
    { name: 'Computational Bio-Pharmacology', category: 'AYUSH_HEALTH_TECH', inDemandScore: 74 },
    { name: 'Data Structures & Algorithms', category: 'PROGRAMMING', inDemandScore: 94 },
    { name: 'React & Next.js', category: 'WEB_MOBILE', inDemandScore: 87 },
    { name: 'Cloud Architecture (AWS/GCP)', category: 'CLOUD_DEVOPS', inDemandScore: 88 },
    { name: 'Communication & Presentation', category: 'SOFT_SKILLS', inDemandScore: 82 },
    { name: 'Critical Problem Solving', category: 'SOFT_SKILLS', inDemandScore: 89 },
    { name: 'Quantitative Aptitude', category: 'APTITUDE', inDemandScore: 80 },
    { name: 'Logical Reasoning', category: 'APTITUDE', inDemandScore: 85 }
  ];

  const skillRecords = new Map<string, string>();
  for (const s of skillsData) {
    const record = await prisma.skill.create({ data: s });
    skillRecords.set(s.name, record.id);
  }

  // 4. Assign Student Skills Scores
  const studentScores = [
    { name: 'Python', score: 82, verified: true, status: 'VERIFIED_BY_ASSESSMENT' },
    { name: 'SQL', score: 76, verified: true, status: 'VERIFIED_BY_INSTITUTION' },
    { name: 'Machine Learning', score: 64, verified: false, status: 'SUBMITTED' },
    { name: 'Deep Learning', score: 48, verified: false, status: 'UNVERIFIED' },
    { name: 'Statistics & Probability', score: 52, verified: false, status: 'UNVERIFIED' },
    { name: 'Git & Version Control', score: 72, verified: true, status: 'VERIFIED_BY_ASSESSMENT' },
    { name: 'Communication & Presentation', score: 78, verified: true, status: 'VERIFIED_BY_INSTITUTION' },
    { name: 'Critical Problem Solving', score: 84, verified: true, status: 'VERIFIED_BY_ASSESSMENT' },
    { name: 'Ayush Health Data Standards', score: 68, verified: true, status: 'VERIFIED_BY_INSTITUTION' },
    { name: 'Docker & Containers', score: 32, verified: false, status: 'UNVERIFIED' }
  ];

  for (const item of studentScores) {
    const skillId = skillRecords.get(item.name);
    if (skillId) {
      await prisma.studentSkillScore.create({
        data: {
          studentId: studentProfileId,
          skillId,
          score: item.score,
          verified: item.verified,
          verificationStatus: item.status,
          verifiedBy: item.verified ? 'All India Institute of Ayurveda Assessment Cell' : null,
          verifiedAt: item.verified ? new Date() : null
        }
      });
    }
  }

  // 5. Create Career Roles Benchmarks & AI Roadmaps
  const careerRoles = [
    {
      title: 'AI & Machine Learning Engineer',
      domain: 'Artificial Intelligence / Healthcare',
      description: 'Designs and scales statistical and deep neural models for healthcare diagnostics and intelligent systems.',
      avgSalary: '₹14 - 24 LPA',
      industryDemandPercentage: 94,
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords.get('Python'), skillName: 'Python', category: 'PROGRAMMING', requiredScore: 80, weight: 1.2 },
        { skillId: skillRecords.get('Machine Learning'), skillName: 'Machine Learning', category: 'AI_ML', requiredScore: 85, weight: 1.5 },
        { skillId: skillRecords.get('Deep Learning'), skillName: 'Deep Learning', category: 'AI_ML', requiredScore: 75, weight: 1.3 },
        { skillId: skillRecords.get('SQL'), skillName: 'SQL', category: 'DATA_SCIENCE', requiredScore: 70, weight: 1.0 },
        { skillId: skillRecords.get('Statistics & Probability'), skillName: 'Statistics & Probability', category: 'DATA_SCIENCE', requiredScore: 75, weight: 1.2 },
        { skillId: skillRecords.get('Docker & Containers'), skillName: 'Docker & Containers', category: 'CLOUD_DEVOPS', requiredScore: 60, weight: 0.9 },
        { skillId: skillRecords.get('Git & Version Control'), skillName: 'Git & Version Control', category: 'PROGRAMMING', requiredScore: 65, weight: 0.8 },
        { skillId: skillRecords.get('Communication & Presentation'), skillName: 'Communication & Presentation', category: 'SOFT_SKILLS', requiredScore: 60, weight: 0.7 }
      ]),
      roadmapJson: JSON.stringify([
        {
          monthNumber: 1,
          title: 'Foundations & Mathematical Rigor',
          focusArea: 'Linear Algebra, Calculus, Advanced Python, NumPy, Pandas',
          skillsToAcquire: ['Advanced Python', 'Matrix Decomposition', 'Vector Calculus'],
          recommendedCourses: [
            { title: 'Mathematics for Machine Learning', provider: 'Imperial College London / Coursera', duration: '4 weeks' },
            { title: 'Data Analysis with Python', provider: 'FreeCodeCamp', duration: '3 weeks' }
          ],
          practicalProject: {
            title: 'Ayush Botanical Dataset Feature Engineering',
            description: 'Clean, normalize, and extract chemical fingerprint features from 5,000 herbal formulations.',
            deliverables: ['Jupyter Notebook', 'Cleaned CSV schema', 'Exploratory Data Analysis Report']
          },
          milestoneAssessment: 'Python & Linear Algebra Benchmark'
        },
        {
          monthNumber: 2,
          title: 'Classical Machine Learning Mastery',
          focusArea: 'Supervised & Unsupervised Algorithms, Regularization, Scikit-learn',
          skillsToAcquire: ['Scikit-Learn', 'Ensemble Trees', 'Cross-Validation & Hyperparameter Tuning'],
          recommendedCourses: [
            { title: 'Machine Learning Specialization', provider: 'DeepLearning.AI', duration: '5 weeks' }
          ],
          practicalProject: {
            title: 'Diagnostic Risk Predictor',
            description: 'Train XGBoost and Random Forest classifiers to predict clinical diagnostic outcomes.',
            deliverables: ['Trained Model Weights', 'ROC-AUC Curves (>0.89)', 'FastAPI Inference Microservice']
          },
          milestoneAssessment: 'Scikit-Learn & Cross Validation Test'
        },
        {
          monthNumber: 3,
          title: 'Deep Learning & Neural Architectures',
          focusArea: 'PyTorch, Backpropagation, CNNs, Sequence Models',
          skillsToAcquire: ['PyTorch', 'Convolutional Nets', 'Attention Mechanisms'],
          recommendedCourses: [
            { title: 'Deep Learning Fundamentals with PyTorch', provider: 'NYU Center for Data Science', duration: '6 weeks' }
          ],
          practicalProject: {
            title: 'Medical Image / Spectrum Classification',
            description: 'Classify micro-spectrophotometry images of raw herbal samples to detect adulteration.',
            deliverables: ['PyTorch Codebase', 'Confusion Matrix Analysis', 'Grad-CAM Interpretability Maps']
          },
          milestoneAssessment: 'Deep Learning Architectures Evaluation'
        },
        {
          monthNumber: 4,
          title: 'NLP & Biomedical Knowledge Graphs',
          focusArea: 'Transformers, HuggingFace, Named Entity Recognition, RAG',
          skillsToAcquire: ['Hugging Face', 'BioBERT', 'Retrieval-Augmented Generation'],
          recommendedCourses: [
            { title: 'Natural Language Processing with Transformers', provider: 'HuggingFace', duration: '4 weeks' }
          ],
          practicalProject: {
            title: 'Ayurveda Classical Text Entity Extractor',
            description: 'Fine-tune BERT on classical Sushruta Samhita translations to link herbs to pharmacological actions.',
            deliverables: ['HuggingFace Model Checkpoint', 'Extracted Knowledge Graph Triples']
          },
          milestoneAssessment: 'NLP & Sequence Processing Benchmark'
        },
        {
          monthNumber: 5,
          title: 'MLOps, Packaging & Cloud Deployment',
          focusArea: 'Docker, MLflow, Docker Compose, AWS SageMaker / GCP Vertex AI',
          skillsToAcquire: ['Docker', 'MLflow Experiment Tracking', 'Model Containerization'],
          recommendedCourses: [
            { title: 'Made With ML - MLOps Course', provider: 'MadeWithML', duration: '4 weeks' }
          ],
          practicalProject: {
            title: 'End-to-End MLOps Pipeline',
            description: 'Containerize and deploy the model with automated CI/CD unit testing and monitoring.',
            deliverables: ['Dockerfile', 'Docker Compose YAML', 'GitHub Actions CI/CD pipeline']
          },
          milestoneAssessment: 'Containerization & MLOps Practical Test'
        },
        {
          monthNumber: 6,
          title: 'Industry Capstone & Interview Readiness',
          focusArea: 'Live Industry Challenges, Technical Mock Interviews, Placement Portfolio',
          skillsToAcquire: ['System Design for AI', 'Mock Interview Mastery', 'Technical Portfolio'],
          recommendedCourses: [
            { title: 'Machine Learning System Design Interview', provider: 'Educative', duration: '3 weeks' }
          ],
          practicalProject: {
            title: 'Production-Grade Health Recommendation Platform',
            description: 'Multi-service AI application serving explainable lifestyle and nutritional recommendations.',
            deliverables: ['Live Web App URL', 'Complete Architecture Whitepaper', 'GitHub Open Source Repository']
          },
          milestoneAssessment: 'Industry Panel Mock Interview & Placement Ready Certification'
        }
      ])
    },
    {
      title: 'Ayurvedic Health Informatics Specialist',
      domain: 'Ayush / Health-Tech Data Science',
      description: 'Bridging traditional Indian medicine knowledge bases with modern electronic health records and ontology mapping.',
      avgSalary: '₹10 - 18 LPA',
      industryDemandPercentage: 88,
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords.get('Ayush Health Data Standards'), skillName: 'Ayush Health Data Standards', category: 'AYUSH_HEALTH_TECH', requiredScore: 85, weight: 1.5 },
        { skillId: skillRecords.get('Python'), skillName: 'Python', category: 'PROGRAMMING', requiredScore: 75, weight: 1.0 },
        { skillId: skillRecords.get('SQL'), skillName: 'SQL', category: 'DATA_SCIENCE', requiredScore: 80, weight: 1.2 },
        { skillId: skillRecords.get('Machine Learning'), skillName: 'Machine Learning', category: 'AI_ML', requiredScore: 65, weight: 1.0 },
        { skillId: skillRecords.get('Communication & Presentation'), skillName: 'Communication & Presentation', category: 'SOFT_SKILLS', requiredScore: 75, weight: 1.1 }
      ]),
      roadmapJson: JSON.stringify([])
    }
  ];

  for (const role of careerRoles) {
    await prisma.careerRole.create({ data: role });
  }

  // 6. Create Comprehensive Assessments & Questions
  const aiAssessment = await prisma.assessment.create({
    data: {
      title: 'AI & Machine Learning Competency Assessment',
      description: 'Covers core machine learning theory, supervised algorithms, feature scaling, model validation, and metrics.',
      category: 'AI_ML',
      durationMinutes: 15,
      passingScore: 65,
      questions: {
        create: [
          {
            skillId: skillRecords.get('Machine Learning')!,
            text: 'Which evaluation metric is most resilient when evaluating a classifier on a heavily imbalanced medical dataset where disease cases represent 1% of instances?',
            optionsJson: JSON.stringify(['Accuracy', 'Precision-Recall AUC (PR-AUC)', 'Mean Squared Error', 'Macro R-Squared']),
            correctOptionIndex: 1,
            explanation: 'In severe class imbalance, high accuracy can be achieved by predicting the majority class. Precision-Recall AUC focuses directly on the minority positive class without being skewed by true negatives.',
            difficulty: 'MEDIUM',
            points: 10
          },
          {
            skillId: skillRecords.get('Machine Learning')!,
            text: 'What primary problem occurs when training an unconstrained Deep Neural Network on a small training dataset with 500 features and only 200 samples?',
            optionsJson: JSON.stringify(['High Bias (Underfitting)', 'High Variance (Overfitting)', 'Vanishing Gradient only', 'Zero Loss Guarantee']),
            correctOptionIndex: 1,
            explanation: 'When feature count outstrips sample size, high capacity models easily memorize sample idiosyncrasies, leading to high variance (severe overfitting).',
            difficulty: 'EASY',
            points: 10
          },
          {
            skillId: skillRecords.get('Python')!,
            text: 'Consider the following Python snippet: [x**2 for x in range(10) if x % 2 == 0]. What is the output?',
            codeSnippet: '[x**2 for x in range(10) if x % 2 == 0]',
            optionsJson: JSON.stringify(['[0, 4, 16, 36, 64]', '[1, 9, 25, 49, 81]', '[0, 2, 4, 6, 8]', '[4, 16, 36, 64, 100]']),
            correctOptionIndex: 0,
            explanation: 'The list comprehension squares even integers in 0..9 (0, 2, 4, 6, 8), producing [0, 4, 16, 36, 64].',
            difficulty: 'EASY',
            points: 10
          },
          {
            skillId: skillRecords.get('Deep Learning')!,
            text: 'Why are residual connections (Skip Connections) fundamental in modern architectures such as ResNet and Transformers?',
            optionsJson: JSON.stringify([
              'They eliminate the need for activation functions.',
              'They mitigate vanishing gradients by enabling identity gradient pathways across deep layers.',
              'They reduce model parameters by 50%.',
              'They guarantee convex optimization.'
            ]),
            correctOptionIndex: 1,
            explanation: 'Residual connections allow uninterrupted gradient backpropagation directly to earlier layers, eliminating vanishing gradient stagnation.',
            difficulty: 'HARD',
            points: 15
          },
          {
            skillId: skillRecords.get('Docker & Containers')!,
            text: 'Which Docker instruction is used to set the primary executable for a containerized machine learning inference service?',
            optionsJson: JSON.stringify(['RUN', 'ENTRYPOINT', 'ARG', 'LABEL']),
            correctOptionIndex: 1,
            explanation: 'ENTRYPOINT specifies the executable command that will always be invoked when the container starts.',
            difficulty: 'EASY',
            points: 10
          }
        ]
      }
    }
  });

  const aptitudeAssessment = await prisma.assessment.create({
    data: {
      title: 'Aptitude & Logical Reasoning Benchmark',
      description: 'Industry standard aptitude testing covering numerical proficiency, analytical puzzles, and verbal reasoning.',
      category: 'APTITUDE',
      durationMinutes: 15,
      passingScore: 60,
      questions: {
        create: [
          {
            skillId: skillRecords.get('Logical Reasoning')!,
            text: 'If all A are B, and some B are C, which conclusion logically follows with absolute certainty?',
            optionsJson: JSON.stringify([
              'All A are C',
              'Some A may be C, but it is not guaranteed',
              'No A are C',
              'All C are A'
            ]),
            correctOptionIndex: 1,
            explanation: 'The subset of B that contains C does not necessarily overlap with the subset of B that contains A.',
            difficulty: 'MEDIUM',
            points: 10
          },
          {
            skillId: skillRecords.get('Quantitative Aptitude')!,
            text: 'A model inference latency decreases from 120ms to 90ms after quantization. What is the percentage improvement in speed?',
            optionsJson: JSON.stringify(['25%', '33.3%', '20%', '30%']),
            correctOptionIndex: 0,
            explanation: '(120 - 90) / 120 = 30 / 120 = 25% reduction in latency.',
            difficulty: 'EASY',
            points: 10
          }
        ]
      }
    }
  });

  // Record a completed attempt for the student
  await prisma.assessmentAttempt.create({
    data: {
      assessmentId: aiAssessment.id,
      studentId: studentProfileId,
      scorePercentage: 78.0,
      passed: true,
      totalCorrect: 4,
      totalQuestions: 5,
      timeSpentSeconds: 420,
      feedback: 'Excellent grasp of ML fundamentals and Python syntax. Suggest deepening knowledge of deep learning backprop mathematics.'
    }
  });

  // 7. Create Diverse Opportunities (Internships, Jobs, Faculty Opportunities)
  const opp1 = await prisma.opportunity.create({
    data: {
      title: 'AI & Healthcare Data Science Intern',
      type: 'INTERNSHIP',
      companyId: 'tcs-bio-it',
      companyName: 'TCS Bio-IT & Life Sciences R&D',
      location: 'Noida / Remote',
      workMode: 'HYBRID',
      description: 'Develop predictive biomedical pipelines, analyze Ayush clinical datasets, and build explainable deep learning classifiers for drug target validation.',
      stipendOrSalary: '₹25,000 / month',
      duration: '6 Months',
      openings: 4,
      eligibleBranches: JSON.stringify(['Computer Science & Engineering', 'Information Technology', 'Bio-IT', 'Data Science']),
      eligibleYears: JSON.stringify([3, 4]),
      minCgpa: 7.5,
      deadline: '2026-10-30',
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords.get('Python'), skillName: 'Python', minScore: 70, isMandatory: true },
        { skillId: skillRecords.get('Machine Learning'), skillName: 'Machine Learning', minScore: 60, isMandatory: true },
        { skillId: skillRecords.get('SQL'), skillName: 'SQL', minScore: 65, isMandatory: true },
        { skillId: skillRecords.get('Git & Version Control'), skillName: 'Git & Version Control', minScore: 60, isMandatory: false }
      ]),
      preferredSkills: JSON.stringify(['PyTorch', 'Ayush Health Data Standards', 'Docker'])
    }
  });

  const opp2 = await prisma.opportunity.create({
    data: {
      title: 'Generative AI & LLM Systems Intern',
      type: 'INTERNSHIP',
      companyId: 'comp-google-partner',
      companyName: 'CloudGen Innovations',
      location: 'Bengaluru',
      workMode: 'REMOTE',
      description: 'Building domain-specific RAG (Retrieval-Augmented Generation) assistants for Indian traditional medicine and medical research portals.',
      stipendOrSalary: '₹35,000 / month',
      duration: '6 Months',
      openings: 2,
      eligibleBranches: JSON.stringify(['Computer Science & Engineering', 'Information Technology', 'Artificial Intelligence']),
      eligibleYears: JSON.stringify([3, 4]),
      minCgpa: 8.0,
      deadline: '2026-11-15',
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords.get('Python'), skillName: 'Python', minScore: 80, isMandatory: true },
        { skillId: skillRecords.get('Deep Learning'), skillName: 'Deep Learning', minScore: 70, isMandatory: true },
        { skillId: skillRecords.get('Natural Language Processing'), skillName: 'Natural Language Processing', minScore: 75, isMandatory: true }
      ])
    }
  });

  const opp3 = await prisma.opportunity.create({
    data: {
      title: 'Ayush Clinical Data Informatics Associate',
      type: 'JOB',
      companyId: 'patanjali-res',
      companyName: 'Patanjali Herbal Research Division',
      location: 'Haridwar / Dehradun',
      workMode: 'ON_SITE',
      description: 'Full-time position coordinating digital clinical trials, standardized Ayurveda terminology mapping (NAMASTE portal sync), and statistical validation.',
      stipendOrSalary: '₹9.5 - 13.0 LPA',
      duration: 'Full-time',
      openings: 5,
      eligibleBranches: JSON.stringify(['Computer Science & Engineering', 'Bio-IT', 'Ayurvedic Medicine', 'Bioinformatics']),
      eligibleYears: JSON.stringify([4]),
      minCgpa: 7.0,
      deadline: '2026-11-30',
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords.get('Ayush Health Data Standards'), skillName: 'Ayush Health Data Standards', minScore: 75, isMandatory: true },
        { skillId: skillRecords.get('SQL'), skillName: 'SQL', minScore: 70, isMandatory: true },
        { skillId: skillRecords.get('Communication & Presentation'), skillName: 'Communication & Presentation', minScore: 70, isMandatory: true }
      ])
    }
  });

  const oppFaculty1 = await prisma.opportunity.create({
    data: {
      title: 'Industry Faculty Sabbatical / Fellowship on AI in Healthcare',
      type: 'FACULTY_INTERNSHIP',
      companyId: 'tcs-bio-it',
      companyName: 'TCS Research Labs & IIT Delhi',
      location: 'New Delhi',
      workMode: 'HYBRID',
      description: '2-month industry fellowship for university professors to conduct joint experimentation on quantum and classical bio-molecular simulation.',
      stipendOrSalary: '₹75,000 / month Honorarium',
      duration: '2 Months',
      openings: 2,
      eligibleBranches: JSON.stringify(['All']),
      eligibleYears: JSON.stringify([]),
      minCgpa: 0,
      deadline: '2026-12-01',
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords.get('Computational Bio-Pharmacology'), skillName: 'Computational Bio-Pharmacology', minScore: 80, isMandatory: true }
      ])
    }
  });

  const oppFaculty2 = await prisma.opportunity.create({
    data: {
      title: 'National FDP on Generative AI & Digital Health Interoperability',
      type: 'FDP',
      companyId: 'all-india-ayush',
      companyName: 'Ministry of Ayush & AIIA',
      location: 'Virtual / Online',
      workMode: 'REMOTE',
      description: '1-week AICTE / Ayush accredited Faculty Development Program on modern FHIR standards, AI diagnostics, and curricula modernization.',
      stipendOrSalary: 'Free / Certificate Granted',
      duration: '1 Week',
      openings: 100,
      eligibleBranches: JSON.stringify(['All']),
      eligibleYears: JSON.stringify([]),
      minCgpa: 0,
      deadline: '2026-10-15',
      requiredSkillsJson: JSON.stringify([])
    }
  });

  // Course Gap Bridge 1: Bridges Deep Learning
  await prisma.opportunity.create({
    data: {
      title: 'Applied Deep Learning with PyTorch for Medical Informatics',
      type: 'TRAINING',
      sourceType: 'NATIVE',
      source: 'INTERNAL',
      companyId: 'tcs-bio-it',
      companyName: 'TCS Life Sciences Academy',
      companyLogo: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=120',
      location: 'Online Interactive',
      workMode: 'REMOTE',
      remote: true,
      description: 'Master convolutional neural networks, sequence transformers, and biomedical feature embeddings with industry-grade mentor feedback and code reviews.',
      stipendOrSalary: 'Free Certification',
      duration: '6 Weeks (30 hours)',
      openings: 150,
      eligibleBranches: JSON.stringify(['Computer Science & Engineering', 'Information Technology', 'Bio-IT']),
      eligibleYears: JSON.stringify([2, 3, 4]),
      minCgpa: 6.5,
      deadline: '2026-12-31',
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords.get('Deep Learning'), skillName: 'Deep Learning', minScore: 0, isMandatory: true }
      ]),
      normalizedSkillsJson: JSON.stringify(['Deep Learning']),
      category: 'AI_ML',
      status: 'ACTIVE',
      approvalStatus: 'APPROVED'
    }
  });

  // Course Gap Bridge 2: Bridges Docker & Containers
  await prisma.opportunity.create({
    data: {
      title: 'Docker & Container Orchestration for Biomedical AI',
      type: 'COURSE',
      sourceType: 'NATIVE',
      source: 'INTERNAL',
      companyId: 'aiia-tech',
      companyName: 'All India Institute of Technology',
      companyLogo: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=120',
      location: 'Online Self-Paced',
      workMode: 'REMOTE',
      remote: true,
      description: 'Comprehensive hands-on training on Docker containerization, multi-stage builds, Docker Compose, and deploying ML pipelines into containerized microservices.',
      stipendOrSalary: 'Free (Sponsored by Ministry of Ayush)',
      duration: '4 Weeks (20 hours)',
      openings: 200,
      eligibleBranches: JSON.stringify(['All']),
      eligibleYears: JSON.stringify([1, 2, 3, 4]),
      minCgpa: 0,
      deadline: '2026-12-31',
      requiredSkillsJson: JSON.stringify([
        { skillId: skillRecords.get('Docker & Containers'), skillName: 'Docker & Containers', minScore: 0, isMandatory: true }
      ]),
      normalizedSkillsJson: JSON.stringify(['Docker & Containers']),
      category: 'CLOUD_DEVOPS',
      status: 'ACTIVE',
      approvalStatus: 'APPROVED'
    }
  });

  // 8. Create Active Application & Full Internship Workspace Lifecycle
  const application1 = await prisma.application.create({
    data: {
      opportunityId: opp1.id,
      applicantId: studentProfileId,
      status: 'ACTIVE_INTERNSHIP',
      matchPercentage: 91.5,
      matchExplanationJson: JSON.stringify({
        overallScore: 91.5,
        matchedSkills: ['Python (82%)', 'SQL (76%)', 'Machine Learning (64%)', 'Git (72%)'],
        missingSkills: [],
        explanation: 'Strong fit: Student satisfies all 4 core technical criteria with high academic standing.'
      }),
      notes: 'Shortlisted with top ranking; cleared technical round on 2026-08-15.'
    }
  });

  const application2 = await prisma.application.create({
    data: {
      opportunityId: opp2.id,
      applicantId: studentProfileId,
      status: 'SHORTLISTED',
      matchPercentage: 86.0,
      interviewDate: '2026-09-24 14:30 IST',
      interviewMeetingLink: 'https://meet.google.com/xyz-skillsync-demo',
      notes: 'Scheduled for round 2 architectural interview.'
    }
  });

  // Active Workspace for Application 1
  const workspace = await prisma.internshipWorkspace.create({
    data: {
      opportunityId: opp1.id,
      studentId: studentProfileId,
      mentorName: 'Rajesh Menon (Principal Scientist, TCS)',
      mentorEmail: 'rajesh.menon@tcshealth.com',
      startDate: '2026-08-20',
      endDate: '2027-02-20',
      status: 'ACTIVE',
      attendanceRate: 96.0,
      tasks: {
        create: [
          {
            title: 'Milestone 1: Biomedical Corpus Preprocessing',
            description: 'Extract raw text from 4,000 Ayush research PDFs and structure into Clean JSONL format.',
            assignedBy: 'Rajesh Menon',
            dueDate: '2026-09-05',
            status: 'APPROVED',
            deliverableUrl: 'https://github.com/swastik-ai/ayush-nlp-preprocessing',
            studentNotes: 'Completed using PyMuPDF and regex sanitization. Filtered noisy OCR artifacts.',
            mentorFeedback: 'Thorough data sanitization and high token yield. Approved with A+ rating.',
            grade: 'A+'
          },
          {
            title: 'Milestone 2: Herb-Compound Vector Embeddings',
            description: 'Generate dense embeddings using BioBERT and evaluate cosine similarity clusters against known Ayurvedic pharmacological categories.',
            assignedBy: 'Rajesh Menon',
            dueDate: '2026-09-28',
            status: 'IN_PROGRESS',
            studentNotes: 'Clustering currently at 0.74 silhouette score. Fine-tuning with contrastive loss.'
          },
          {
            title: 'Milestone 3: FastAPI Web Service & Swagger Documentation',
            description: 'Expose the inference API via Dockerized FastAPI with authenticated endpoints.',
            assignedBy: 'Rajesh Menon',
            dueDate: '2026-10-20',
            status: 'TODO'
          }
        ]
      },
      weeklyReports: {
        create: [
          {
            weekNumber: 1,
            hoursWorked: 38,
            summary: 'Completed environmental setup, data governance compliance review, and initial pipeline profiling.',
            keyLearnings: JSON.stringify(['GCP Bio-IT Sandbox setup', 'Standardized medical vocabulary (ICD-11 & NAMASTE)', 'Git feature branching protocol']),
            mentorStatus: 'APPROVED',
            mentorComments: 'Great start to the internship. Clear understanding of project objectives.'
          },
          {
            weekNumber: 2,
            hoursWorked: 36,
            summary: 'Engineered preprocessing parser for multimodal formulation tables. Extracted 12,000 active ingredient entities.',
            keyLearnings: JSON.stringify(['PyTorch embedding layers', 'Fast tokenizer optimization', 'Data leakage prevention']),
            mentorStatus: 'APPROVED',
            mentorComments: 'Impressive progress on the dataset parsing task.'
          }
        ]
      }
    }
  });

  // 9. Verified Digital Student Portfolio Items
  await prisma.studentProject.create({
    data: {
      studentId: studentProfileId,
      title: 'AyurScan: AI Botanical Identification System',
      description: 'Mobile-friendly deep learning web platform identifying raw medicinal plants with 96.4% top-1 accuracy using custom MobileNetV3 and FastAPI backend.',
      skillsUsed: JSON.stringify(['Python', 'PyTorch', 'FastAPI', 'React', 'Docker']),
      githubUrl: 'https://github.com/swastik-ai/ayurscan-ai',
      liveDemoUrl: 'https://ayurscan-demo.skillsync.edu',
      verifiedByMentor: true,
      mentorComments: 'Verified by Prof. Priya Nambiar during AIIA Annual Tech Exposition 2026.'
    }
  });

  await prisma.studentProject.create({
    data: {
      studentId: studentProfileId,
      title: 'HealthGraph RAG: Ayurvedic Formulations Explorer',
      description: 'Knowledge graph database integrating classical Sanskrit pharmacopoeia with modern PubChem molecular databases via vector similarity.',
      skillsUsed: JSON.stringify(['Python', 'LangChain', 'pgvector', 'Neo4j', 'TypeScript']),
      githubUrl: 'https://github.com/swastik-ai/healthgraph-rag'
    }
  });

  await prisma.verifiedCertificate.create({
    data: {
      studentId: studentProfileId,
      title: 'Certified Machine Learning Specialist',
      issuingOrganization: 'All India Institute of Ayurveda & Technology Assessment Center',
      issueDate: '2026-06-15',
      verificationCode: 'SKILLSYNC-AIIA-2026-ML-98214',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'Institutional Examination Board'
    }
  });

  await prisma.verifiedCertificate.create({
    data: {
      studentId: studentProfileId,
      title: 'Python for Data Engineering Professional',
      issuingOrganization: 'Ministry of Electronics & Information Technology (MeitY) / NASSCOM',
      issueDate: '2026-04-10',
      verificationCode: 'NASSCOM-FUTURESKILLS-874102',
      verificationStatus: 'VERIFIED',
      verifiedBy: 'Industry Consortium'
    }
  });

  // 10. Collaboration Hub Items
  await prisma.mentorshipSlot.create({
    data: {
      mentorName: 'Dr. Anand Ramanathan',
      mentorTitle: 'Chief AI Architect',
      companyName: 'Siemens Healthineers / TCS Health',
      expertiseAreas: JSON.stringify(['Medical Imaging AI', 'Healthcare MLOps', 'Career Transition']),
      availableSlots: JSON.stringify(['Tuesday 18:00 IST', 'Thursday 19:30 IST', 'Saturday 11:00 IST']),
      maxMentees: 6,
      currentMenteesCount: 3,
      bio: '20+ years building mission-critical FDA/CE approved clinical AI diagnostic solutions.'
    }
  });

  await prisma.mentorshipSlot.create({
    data: {
      mentorName: 'Sunita Chawla',
      mentorTitle: 'Director of Talent & Campus Partnerships',
      companyName: 'Wipro Health Sciences',
      expertiseAreas: JSON.stringify(['Resume Strategy', 'Placement Interviews', 'Corporate Readiness']),
      availableSlots: JSON.stringify(['Wednesday 17:00 IST', 'Friday 16:00 IST']),
      maxMentees: 8,
      currentMenteesCount: 4,
      bio: 'Advising students on competitive corporate recruitment and skill portfolio presentation.'
    }
  });

  await prisma.innovationChallenge.create({
    data: {
      title: 'SIH National Grand Challenge: AI for Ayush Formulation Standardization',
      industryName: 'Ministry of Ayush / All India Institute of Ayurveda',
      problemStatement: 'Develop automated computer vision and spectroscopic validation algorithms to detect adulteration in high-demand Ayurvedic raw materials.',
      domain: 'Smart Automation & AI in Healthcare',
      prizePool: '₹3,00,000 + Incubation Support',
      submissionDeadline: '2026-11-20',
      evaluationCriteria: JSON.stringify(['Model Accuracy (>95%)', 'Zero-Latency Edge Inference', 'Institutional Reproducibility', 'Explainability']),
      registeredTeamsCount: 42
    }
  });

  await prisma.researchProposal.create({
    data: {
      title: 'Graph Neural Networks for Multi-Herb Synergy Prediction',
      leadFacultyName: 'Dr. Priya Nambiar',
      institutionName: 'All India Institute of Ayurveda',
      partnerIndustryName: 'TCS Bio-IT & Life Sciences R&D',
      focusArea: 'Computational Herbal Synergy & Drug Discovery',
      objectives: JSON.stringify([
        'Map 2,000 classical Polyherbal combinations into molecular interaction graphs',
        'Predict synergistic therapeutic indices using GNNs',
        'Publish joint peer-reviewed paper in Journal of Ethnopharmacology'
      ]),
      fundingExpected: '₹35,00,000 (Industry Sponsored)',
      durationMonths: 18,
      status: 'IN_PROGRESS'
    }
  });

  // 11. Notifications
  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: '🔥 New 92% Match Internship Opportunity!',
      message: 'TCS Bio-IT & Life Sciences R&D just published "AI & Healthcare Data Science Intern" matching your verified skills.',
      type: 'OPPORTUNITY',
      isRead: false
    }
  });

  await prisma.notification.create({
    data: {
      userId: studentUser.id,
      title: '✅ Milestone 1 Task Approved by Mentor',
      message: 'Rajesh Menon approved your deliverable "Biomedical Corpus Preprocessing" with grade A+.',
      type: 'SUCCESS',
      isRead: true
    }
  });

  // 12. Institutional Sync Log
  await prisma.institutionalSyncLog.create({
    data: {
      institutionId: 'aiia-delhi',
      recordsSynced: 2450,
      status: 'SUCCESS',
      syncType: 'ERP_STUDENT_ENROLLMENT_AND_GRADES'
    }
  });

  console.log('✅ SkillSync Master Database Seeding Completed Successfully!');
  console.log('👥 Test Accounts:');
  console.log('   🎓 Student:     student@skillsync.edu   (password123)');
  console.log('   👨‍🏫 Faculty:     faculty@aiia.gov.in     (password123)');
  console.log('   🏢 Industry:    recruiter@tcshealth.com (password123)');
  console.log('   🏫 Institution: dean@aiia.gov.in        (password123)');
  console.log('   🛡️ Admin:       admin@skillsync.gov.in  (password123)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
