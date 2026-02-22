# Mile One — CDL Career App

**Start your CDL career. Get licensed, funded & hired.**

A React Native (Expo) mobile app with three core modules: CDL permit prep quiz, school funding, and job placement.

## Tech Stack

- **React Native + Expo** — Cross-platform iOS/Android
- **Supabase** — Backend (PostgreSQL, Auth, Edge Functions)
- **NativeWind** — Tailwind CSS for React Native
- **React Navigation** — Tab + Stack navigation

---

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Copy your project URL and anon key from **Settings → API**
3. Create a `.env` file from the template:

```bash
cp .env.example .env
```

4. Fill in your Supabase credentials:

```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Database Schema

Open the Supabase SQL Editor and run the contents of `supabase/schema.sql`. This creates all tables, RLS policies, and seeds sample data (10 carriers + 30 quiz questions).

### 4. Import Your 600 Questions

Format your questions as CSV or SQL insert statements matching this schema:

```sql
INSERT INTO questions (question_text, option_a, option_b, option_c, option_d, correct_answer, category, difficulty, explanation)
VALUES ('Your question?', 'Option A', 'Option B', 'Option C', 'Option D', 'A', 'General Knowledge', 'medium', 'Explanation text');
```

**Valid categories:** General Knowledge, Air Brakes, Combination Vehicles, Hazmat, Tanker, Doubles/Triples, Pre-Trip Inspection, Basic Controls

**Valid difficulties:** easy, medium, hard

**Valid correct_answer:** A, B, C, D

### 5. Deploy Edge Functions (Optional)

For email notifications on new loan/job applications:

```bash
# Install Supabase CLI
npm install -g supabase

# Link to your project
supabase link --project-ref your-project-ref

# Set secrets
supabase secrets set RESEND_API_KEY=your-resend-api-key

# Deploy functions
supabase functions deploy notify-loan-application
supabase functions deploy notify-application
supabase functions deploy notify-bulk-application
```

The app works fine without deploying these — notifications are fire-and-forget.

### 6. Run the App

```bash
# Start Expo dev server
npx expo start

# Run on iOS simulator
npx expo start --ios

# Run on Android emulator
npx expo start --android

# Run in web browser
npx expo start --web
```

---

## Project Structure

```
src/
├── components/
│   └── common/          # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       ├── ProgressBar.tsx
│       └── ScreenWrapper.tsx
├── constants/
│   └── index.ts         # Colors, categories, config
├── hooks/
│   ├── useAuth.ts       # Authentication hook
│   ├── useQuiz.ts       # Quiz logic + stats
│   ├── useStreak.ts     # Daily streak tracking
│   └── useNotifications.ts  # Push notifications
├── lib/
│   ├── supabase.ts      # Supabase client
│   ├── AuthContext.tsx   # Auth provider
│   └── OnboardingContext.tsx  # Onboarding state
├── navigation/
│   └── AppNavigator.tsx # All navigation (tabs + stacks)
├── screens/
│   ├── onboarding/      # 3-screen onboarding flow
│   │   ├── StageSelectScreen.tsx
│   │   ├── OnboardingQuizScreen.tsx
│   │   └── OnboardingResultsScreen.tsx
│   ├── quiz/            # CDL quiz module
│   │   ├── QuizHomeScreen.tsx
│   │   ├── QuizSessionScreen.tsx
│   │   ├── CategorySelectScreen.tsx
│   │   └── QuizResultsScreen.tsx
│   ├── funding/         # School funding module
│   │   ├── FundingHomeScreen.tsx
│   │   ├── FundingApplicationScreen.tsx
│   │   └── FundingConfirmationScreen.tsx
│   ├── jobs/            # Job placement module
│   │   ├── JobsHomeScreen.tsx
│   │   ├── ApplyAllScreen.tsx
│   │   ├── ApplySuccessScreen.tsx
│   │   └── ProfileBuilderScreen.tsx
│   ├── profile/
│   │   └── ProfileScreen.tsx
│   └── admin/
│       ├── AdminLoansScreen.tsx
│       └── AdminApplicationsScreen.tsx
└── types/
    └── index.ts         # TypeScript types
supabase/
├── schema.sql           # Full database schema + seed data
└── functions/           # Edge functions for email notifications
    ├── notify-loan-application/
    ├── notify-application/
    └── notify-bulk-application/
```

---

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | User profiles (extends Supabase Auth) |
| `questions` | 600 CDL quiz questions |
| `user_answers` | Per-question performance tracking |
| `loan_applications` | School funding leads |
| `driver_profiles` | CDL driver details for job matching |
| `carriers` | Job listings from trucking companies |
| `applications` | Job applications linking users to carriers |

All tables have Row Level Security (RLS) enabled. Users can only access their own data. Admin access is granted to users with `admin@mileone.com` email.

---

## Module Details

### Onboarding Flow
1. **Stage Select** — "Where are you in your CDL journey?" (4 options)
2. **Sample Quiz** — 10 questions, no signup required, immediate feedback
3. **Save Progress** — Name, email, phone → creates Supabase Auth account

### Quiz Module
- **Daily Practice** — 20 questions from weak categories
- **Category Drill** — Select a specific CDL test section
- **Mock Exam** — 50 questions, 60-minute timer
- **Performance Dashboard** — Overall %, by category, streak counter
- **Push Notifications** — Daily 8 AM reminder

### School Funding Module
- Pre-filled user info
- Loan amount selection ($1K–$10K)
- Employment status, income, zip code
- Leads stored in `loan_applications` table
- Email notification to admin on submission

### Job Board Module
- **5-Step Profile Builder** — License, preferences, experience, violations, addresses
- **Profile completeness** drives visibility ("Visible to X carriers")
- **Carrier cards** with pay, home time, equipment, match indicator
- **Apply to All** — One-tap bulk application
- **Individual apply** — Per-carrier application
- **Admin dashboard** with CSV export

---

## Design System

| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#0F172A` (Navy) | Backgrounds |
| Accent | `#F59E0B` (Amber) | CTAs, highlights |
| Success | `#22C55E` | Correct answers, passing |
| Error | `#EF4444` | Wrong answers, alerts |
| Surface | `#1E293B` | Cards, inputs |

Dark mode throughout. Card-based layout. One clear CTA per screen.
