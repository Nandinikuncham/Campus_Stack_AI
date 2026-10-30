# CampusStackAI 🎓✨

**CampusStackAI** is a full-stack, AI-augmented community knowledge-sharing platform tailored specifically for college students, university engineering curricula, and placement preparation.

> **Tagline**: *Learn Together. Solve Together.*

---

## 🚀 Key Features

- **Community Q&A Engine**:
  - Ask questions with Markdown and syntax-highlighted code blocks.
  - Socratic hints, question enhancement, and line-by-line code explanation powered by OpenAI (`gpt-4o-mini`).
  - Community upvoting/downvoting with self-vote prevention.
  - Accepted answer verification by question authors (awards +15 reputation).
  - Nested comments and thread discussions.
  - Question bookmarks and tag filtering.

- **AI Study Assistant**:
  - Interactive standalone workspace.
  - Explain complex computer science and engineering concepts in plain language.
  - Guided Socratic hints without direct code spoilers.
  - Detailed code complexity analysis ($O(n)$ time and auxiliary space).
  - Summarize long discussions and capture key takeaways.

- **Campus Social & Gamification**:
  - Student profiles detailing University/College, Department, Graduation Year, and Technical Skills.
  - Reputation points earned from constructive answers, accepted solutions, and community votes.
  - Bronze, Silver, and Gold achievement badges.
  - Campus Leaderboard ranking top student contributors.

- **Moderation & Security**:
  - Community flagging dialog for offensive or duplicate content.
  - Admin & Moderator console to review reports, resolve tickets, and delete inappropriate content.
  - Supabase PostgreSQL Row Level Security (RLS) policies protecting user data.
  - Secure session handling via `@supabase/ssr` cookies and Next.js middleware.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui design primitives + Lucide Icons |
| **Database** | Supabase (PostgreSQL with RLS, triggers, full-text search) |
| **Auth** | Supabase Auth (Email/Password, OAuth session tokens) |
| **AI** | OpenAI API (`gpt-4o-mini`, structured JSON responses) |
| **Markdown** | `react-markdown`, `remark-gfm`, `rehype-highlight` |

---

## 📦 Project Structure

```
campusstackai/
├── src/
│   ├── app/
│   │   ├── (auth)/             # Login, signup, onboarding, password recovery
│   │   ├── (main)/             # Dashboard, questions, ask, profile, AI assistant, leaderboard, admin
│   │   ├── api/                # REST endpoints for questions, answers, votes, comments, AI, reports
│   │   ├── landing/            # Public marketing landing page
│   │   ├── globals.css         # Tailwind & theme variables
│   │   └── layout.tsx          # Root theme provider and toaster
│   ├── components/
│   │   ├── ai/                 # AIAssistantPanel component
│   │   ├── layout/             # TopBar, Sidebar, RightSidebar
│   │   ├── moderation/         # ReportDialog
│   │   ├── notifications/      # NotificationBell
│   │   ├── questions/          # QuestionCard, AnswerCard, AnswerEditor, VoteButtons, TagBadge
│   │   ├── shared/             # ThemeToggle, EmptyState, Pagination, LoadingSpinner
│   │   └── ui/                 # Accessible UI primitives (Button, Card, Tabs, Dialog, etc.)
│   ├── hooks/                  # useAuth hook
│   ├── lib/
│   │   ├── ai/                 # OpenAI client & model configurations
│   │   ├── supabase/           # Browser & server Supabase clients
│   │   ├── constants.ts        # Colleges, departments, tags, reputation values
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── utils.ts            # Formatting & utility functions
│   └── middleware.ts           # Route protection & session refresh
├── supabase/
│   └── migrations/             # SQL schema, RLS policies, and seed data
└── .env.example                # Environment variable template
```

---

## ⚡ Getting Started

### 1. Prerequisites
- Node.js 18+ (tested on Node v20/v26)
- A [Supabase](https://supabase.com) project
- An [OpenAI](https://platform.openai.com) API key (optional for local testing, fallback modes included)

### 2. Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4o-mini
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=CampusStackAI
```

### 3. Database Setup
Run the SQL migrations in order in your Supabase SQL Editor:
1. `supabase/migrations/001_initial_schema.sql` (Tables, constraints, triggers, search vector)
2. `supabase/migrations/002_rls_policies.sql` (Row Level Security rules)
3. `supabase/migrations/003_seed_data.sql` (Initial tags and badges)

### 4. Install & Run
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Production Build
```bash
npm run build
npm start
```
