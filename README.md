# SkillSync — Academia–Industry Collaboration Platform for Skill Mapping, Internships & Placement

**SIH Problem Statement 26044** • **Ministry of Ayush / All India Institute of Ayurveda** • **Software / Smart Automation**

---

## 🎯 Executive Overview

SkillSync solves the academia–industry skill gap through a closed-loop intelligence architecture:

$$\text{Student Skills} \longrightarrow \text{Industry Requirements} \longrightarrow \text{AI Skill Gap Engine} \longrightarrow \text{Targeted Learning} \longrightarrow \text{Explainable Matching} \longrightarrow \text{Placement}$$

SkillSync integrates the **4 primary stakeholders** on a single unified platform:
- 🎓 **Student Portal**: Timed technical assessments, Skill Gap Analyzer, AI 6-Month Career Roadmaps, Explainable Internship Matches (92%), Internship Workspace, and Verified Digital Portfolio.
- 👨‍🏫 **Academician / Faculty Portal**: Faculty internships, industrial sabbaticals, AICTE/Ayush FDPs, joint research grant proposals, and student mentorship.
- 🏢 **Industry Portal**: Posting management, AI Candidate Talent Search with minimum compatibility filters, recruitment pipeline kanban, intern task oversight, and completion certificates.
- 🏫 **Institution Portal**: Student Readiness Index, department-wise readiness comparison, nation-wide skill gaps radar, industry demand intelligence, and University ERP/SIS integration.
- 🛡️ **Super Admin & Collaboration Hub**: Mentorship slots booking, SIH national grand challenges, and system integrity oversight.

---

## 🧠 Multi-Model AI Architecture with Groq

Rather than relying on a single general-purpose LLM, SkillSync implements a centralized **AI Orchestrator** managing **5 specialized model categories**:

```
                         ┌────────────────────┐
                         │   AI ORCHESTRATOR  │
                         └─────────┬──────────┘
                                   │
          ┌────────────────────────┼───────────────────────┐
          │                        │                       │
          ▼                        ▼                       ▼
   ┌──────────────┐        ┌──────────────┐        ┌──────────────┐
   │  Groq LLM    │        │  Embeddings  │        │  ML Models   │
   │              │        │              │        │              │
   │ Career AI    │        │ Matching     │        │ Readiness    │
   │ AI Assistant │        │ Search       │        │ Prediction   │
   │ Resume AI    │        │ RAG          │        │ Demand       │
   │ Interview    │        │              │        │ Analytics    │
   └──────────────┘        └──────────────┘        └──────────────┘
          │                        │                       │
          └────────────────────────┼───────────────────────┘
                                   ▼
                          ┌──────────────────┐
                          │ Recommendation   │
                          │ / Decision Layer │
                          └────────┬─────────┘
                                   ▼
                              Application
```

### The 5 Specialized Model Engines:
1. **Model 1: General Reasoning LLM (**Groq Cloud LPU**)**:
   - Model: `llama-3.3-70b-versatile` (or `llama-3.1-8b-instant`).
   - Handles natural language career roadmaps, gap explanations, ATS bullet point rewriting, and technical mock interview scoring.
2. **Model 2: Dense Semantic Embedding Engine**:
   - 384-dimensional dense semantic vectors with Cosine Similarity calculation for profile and job matching.
3. **Model 3: Cross-Encoder Context Reranker**:
   - Two-stage retrieval layer refining Top-50 vector matches down to Top-10 with verified badge bonuses.
4. **Model 4: Classical ML Predictive Models**:
   - **Placement Probability Predictor**: Supervised 7-feature logistic probability model (e.g. 89% Highly Placement Ready).
   - **Skill Demand Forecaster**: Time-series moving averages forecasting quarterly industry demand surges.
5. **Model 5: Document AI & Resume Parser**:
   - Extracts structured candidate entities from raw resumes and certificates.
6. **Multi-Stage RAG Pipeline**:
   - Vector Search $\to$ Cross-Encoder Rerank $\to$ Groq LLM Synthesis with domain knowledge sources (Ayush NAMASTE standards, AI benchmarks, AICTE policies).

---

## ⚡ Quick Start (Local Windows / Linux / macOS)

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Install Dependencies & Build Monorepo
```bash
npm install
npm run build --workspace=@skillsync/shared
npm run build --workspace=@skillsync/backend
```

### 3. Initialize & Seed Database
```bash
cd backend
npx prisma db push
npx tsx src/database/seed.ts
```

### 4. Run Development Servers
In separate terminal windows:
```bash
# Terminal 1: Backend API (port 5000)
npm run start:backend

# Terminal 2: Frontend App (port 3000)
npm run start:frontend
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

*(Optional)* Set `GROQ_API_KEY=your_key_here` in `backend/.env` to connect directly to your Groq Cloud account, or run out-of-the-box with the built-in resilient engine.

---

## 👥 Demo Stakeholder Credentials & Personas

SkillSync includes a **Persistent Stakeholder Switcher Bar** pinned at the top of the interface allowing instant one-click switching during SIH evaluations:

| Stakeholder Role | Name & Affiliation | Demo Email | Password |
| :--- | :--- | :--- | :--- |
| 🎓 **Student** | Swastik Sharma (AIIA CSE 3rd Year) | `student@skillsync.edu` | `password123` |
| 👨‍🏫 **Faculty** | Dr. Priya Nambiar (Assoc. Prof, AIIA) | `faculty@aiia.gov.in` | `password123` |
| 🏢 **Industry** | Rajesh Menon (TCS Bio-IT & Life Sciences) | `recruiter@tcshealth.com` | `password123` |
| 🏫 **Institution** | Dr. Vikram Malhotra (Dean of Academics, AIIA) | `dean@aiia.gov.in` | `password123` |
| 🛡️ **Admin** | SkillSync Platform Administrator | `admin@skillsync.gov.in` | `password123` |

---

## ⚙️ Environment Setup & Configuration

SkillSync features a centralized, validated, and type-safe configuration architecture powered by **Zod** schema validation and a NestJS-inspired `ConfigService`.

### 1. Quick Setup Checklist

1. **Copy environment template files**:
   ```bash
   # Backend
   cp backend/.env.example backend/.env

   # Frontend
   cp frontend/.env.example frontend/.env.local
   ```
2. **Configure Database**:
   - For instant zero-config testing: Leave `DATABASE_URL="file:./dev.db"` (SQLite default).
   - For production PostgreSQL: Set `DATABASE_URL="postgresql://user:pass@localhost:5432/skillsync?schema=public"`.
3. **Configure Authentication**:
   - Set a strong `JWT_SECRET` (at least 32 characters in production).
4. **Configure AI Provider**:
   - Set `AI_PROVIDER=groq` (default) with `GROQ_API_KEY`, or switch to `openai`, `gemini`, or `anthropic`.
   - *Note*: If no external API key is provided, the platform automatically activates its built-in resilient fallback engine for 100% demo uptime.
5. **Configure Redis (Optional for local dev, recommended in production)**:
   - Set `REDIS_URL="redis://localhost:6379"`.
6. **Configure Storage**:
   - `STORAGE_PROVIDER=local` (stores uploads locally) or `s3` (AWS S3 / MinIO).
7. **Start the backend and frontend**:
   ```bash
   npm run start:backend
   npm run start:frontend
   ```

---

### 2. Environment Variables Reference Table

| Variable | Required | Default / Example | Purpose |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Yes | `development` | Application lifecycle environment (`development`, `production`, `test`). |
| `PORT` | Yes | `5000` | Backend Express server port. |
| `API_PREFIX` | Yes | `api/v1` | URL routing prefix for all REST endpoints. |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | Frontend web client URL. |
| `CORS_ORIGIN` | Yes | `http://localhost:3000` | Allowed origins for Cross-Origin Resource Sharing. |
| `DATABASE_URL` | **Yes** | `file:./dev.db` | Primary relational database connection URL (SQLite or PostgreSQL). |
| `DIRECT_DATABASE_URL` | Optional | `postgresql://...` | Unpooled direct connection for migrations. |
| `JWT_SECRET` | **Yes** | Min 8 chars | Master HMAC secret for signing and verifying user authentication tokens. |
| `JWT_EXPIRES_IN` | Yes | `7d` | Access token lifespan. |
| `JWT_REFRESH_SECRET` | Optional | Min 8 chars | Refresh token signing secret. |
| `JWT_REFRESH_EXPIRES_IN`| Optional | `30d` | Refresh token lifespan. |
| `AI_PROVIDER` | **Yes** | `groq` | Active LLM engine (`groq`, `openai`, `gemini`, `anthropic`). |
| `LLM_MODEL` | **Yes** | `llama-3.3-70b-versatile` | Model name passed to the active LLM provider. |
| `LLM_TEMPERATURE` | Optional | `0.2` | Generation randomness parameter (0.0 – 2.0). |
| `LLM_MAX_TOKENS` | Optional | `1024` | Maximum completion tokens per AI generation. |
| `GROQ_API_KEY` | Conditional | `gsk_...` | Required for live Groq Cloud LPU inference. |
| `OPENAI_API_KEY` | Conditional | `sk-...` | Required if `AI_PROVIDER=openai` in production. |
| `GEMINI_API_KEY` | Conditional | `AIzaSy...` | Required if `AI_PROVIDER=gemini` in production. |
| `ANTHROPIC_API_KEY` | Conditional | `sk-ant-...` | Required if `AI_PROVIDER=anthropic` in production. |
| `EMBEDDING_PROVIDER` | Yes | `dense-local` | Embedding engine (`dense-local` for 384-dim, `openai` for 1536-dim). |
| `EMBEDDING_MODEL` | Yes | `all-MiniLM-L6-v2` | Embedding model identifier. |
| `EMBEDDING_DIMENSIONS` | Yes | `384` | Dimensionality of generated vector embeddings. |
| `RERANKER_PROVIDER` | Yes | `cross-encoder` | Two-stage candidate reranker (`cross-encoder`, `cohere`, `disabled`). |
| `VECTOR_DATABASE_URL` | Optional | `postgresql://...` | PostgreSQL connection with `pgvector` extension. |
| `REDIS_URL` | Conditional | `redis://localhost:6379` | Redis connection URL for caching and task queues. |
| `STORAGE_PROVIDER` | Yes | `local` | Upload storage backend (`local` or `s3`). |
| `S3_BUCKET` | Conditional | `skillsync-resumes` | S3 bucket name (required if `STORAGE_PROVIDER=s3`). |
| `S3_REGION` | Conditional | `ap-south-1` | S3 AWS/MinIO region. |
| `EMAIL_PROVIDER` | Yes | `console` | Dispatch channel (`console`, `smtp`, `sendgrid`). |
| `NOTIFICATION_ENABLED`| Yes | `true` | System in-app notifications toggle. |
| `NEXT_PUBLIC_API_URL` | **Yes** | `http://localhost:5000/api/v1` | Public backend API URL exposed to browser. |
| `NEXT_PUBLIC_APP_NAME`| Optional | `SkillSync Portal` | Public portal title for browser tabs and banners. |

---

### 3. Hot-Switching AI Providers via `.env`

To switch AI reasoning models without changing a single line of application source code:

```env
# Switch to OpenAI
AI_PROVIDER=openai
LLM_MODEL=gpt-4o-mini
OPENAI_API_KEY=sk-...

# Switch to Google Gemini
AI_PROVIDER=gemini
LLM_MODEL=gemini-1.5-flash
GEMINI_API_KEY=AIzaSy...

# Switch to Anthropic Claude
AI_PROVIDER=anthropic
LLM_MODEL=claude-3-5-sonnet-20240620
ANTHROPIC_API_KEY=sk-ant-...
```
The central `LLMFactory` and `AIOrchestratorService` dynamically instantiate the matching provider on server launch.

