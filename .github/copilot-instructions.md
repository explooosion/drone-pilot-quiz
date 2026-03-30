# Drone Pilot Quiz — Copilot Instructions

## Project Overview

Taiwan drone pilot exam preparation web app (遙控無人機操作證學科題庫). Built with React 19 + TypeScript + TailwindCSS v4, deployed on GitHub Pages with custom domain `drone-quiz.tw`. All state in localStorage, no backend.

## Tech Stack

- **Runtime**: Vite 8 + React 19 + TypeScript (strict, `verbatimModuleSyntax: true`)
- **Compiler**: React Compiler enabled via `@rolldown/plugin-babel` + `babel-plugin-react-compiler`
- **Styling**: TailwindCSS v4 via `@tailwindcss/vite` plugin, using `@theme` directive for custom design tokens
- **Routing**: react-router-dom v7 with `BrowserRouter` + `public/404.html` SPA redirect (spa-github-pages pattern)
- **Icons**: react-icons (`react-icons/hi` Heroicons v1, `react-icons/hi2` Heroicons v2 for consistent fill/outline pairs)
- **Code Quality**: ESLint + Prettier + Husky + lint-staged
- **Analytics**: Google Tag Manager (`GTM-P4TDWZDX`) in `index.html`

## Commands

```bash
npm run dev          # Start dev server (Vite, host 0.0.0.0)
npm run build        # Type-check + production build
npm run lint         # ESLint
npm run format       # Prettier format all files
npm run format:check # Prettier check (CI)
npm run parse-pdf    # Parse PDFs to JSON (node scripts/parse-pdf.mjs)
npm run update-questions  # Download + parse from CAA (node scripts/update-questions.mjs)
```

## Project Structure

```
.github/
  copilot-instructions.md   # This file
  workflows/
    deploy.yml              # GitHub Pages deploy on push to main
    update-questions.yml    # Weekly question bank auto-update
scripts/
  parse-pdf.mjs             # PDF → JSON conversion (pdf-parse v2)
  update-questions.mjs      # Download PDFs from CAA + run parse
public/
  404.html                  # SPA redirect for BrowserRouter on GitHub Pages
  CNAME                     # Custom domain: drone-quiz.tw
  favicon.svg               # App favicon (SVG)
  icons.svg                 # Icon sprite
  question/                 # Source PDF files (3 banks)
src/
  main.tsx                  # Entry point: BrowserRouter → ThemeProvider → ConsentProvider → App
  App.tsx                   # Route definitions
  index.css                 # Tailwind + @theme design tokens
  types/index.ts            # All TypeScript types
  contexts/
    ThemeContext.tsx         # Theme provider (light/dark/system)
    ConsentContext.tsx       # Privacy consent dialog + localStorage write guard
  hooks/
    useLocalStorage.ts      # Generic localStorage hook
    useQuestions.ts         # Load question bank JSON (dynamic import + cache)
    useProgress.ts          # Practice mode progress tracking
    useExam.ts              # Exam state machine (timer, scoring, history)
    usePreferences.ts       # User preferences (examAutoAdvance, practiceShowAnswer)
    useSwipe.ts             # Touch swipe gesture detection
  components/
    layout/
      Header.tsx            # App header with nav + theme toggle (hamburger always visible)
      Footer.tsx            # Footer with update dates + links
      MobileMenu.tsx        # Slide-out menu with nav, preferences modal, privacy policy
      Layout.tsx            # Main layout wrapper
      ThemeToggle.tsx       # Light/Dark/System toggle
    quiz/
      QuestionCard.tsx      # Question display card (practice/exam/review modes)
      OptionButton.tsx      # Individual A/B/C/D option
      ProgressBar.tsx       # Progress indicator (supports compact mode)
      QuestionNav.tsx       # Bottom navigation bar
      Timer.tsx             # Exam countdown timer
    ui/
      AlertDialog.tsx       # Confirmation modal dialog (supports danger variant)
  pages/
    HomePage.tsx            # Landing / mode selection + source + disclaimer
    CategorySelectPage.tsx  # Bank type selector
    PracticePage.tsx        # Question bank practice (reveal mode, swipe, compact layout)
    ExamPage.tsx            # Mock exam (auto-advance, abandon button)
    ExamResultPage.tsx      # Exam score + review
    ExamHistoryPage.tsx     # Past exam records
    BookmarksPage.tsx       # Bookmarked questions
  utils/
    storage.ts              # localStorage keys + helpers (consent-guarded writes)
    exam-config.ts          # Exam parameters per bank type
  data/
    basic.json              # Generated: 普通操作證題庫 (388 questions)
    professional.json       # Generated: 專業操作證題庫 (587 questions)
    renewal.json            # Generated: 屆期換證題庫 (317 questions)
    metadata.json           # Generated: bank metadata (update dates)
```

## Design System

- **Primary**: CAA blue `#003D79` (primary-800) — used for buttons, links, active states
- **Success**: Green — correct answers in practice/review mode
- **Danger**: Red — wrong answers in review mode, destructive actions
- **Dark mode**: `.dark` class on `<html>`, toggled via ThemeContext
- **UI style**: SurveyCake-inspired — clean card-based, one question per view, rounded-xl corners, generous padding

## Coding Conventions

- Use `import type` for type-only imports (required by `verbatimModuleSyntax`)
- Named exports only (no default exports)
- React 19: use `React.use()` for context, `<Context value={}>` provider syntax
- Functional components only
- Custom hooks in `src/hooks/`, prefixed with `use`
- Keep components focused and composable
- Use TailwindCSS classes, avoid inline styles
- All user-facing text in Traditional Chinese (zh-TW)

## Question Bank Types

| Type           | Label              | Questions | Exam Time | Pass Score |
| -------------- | ------------------ | --------- | --------- | ---------- |
| `basic`        | 普通操作證         | 40        | 30 min    | 70         |
| `professional` | 專業操作證         | 80        | 60 min    | 70         |
| `renewal`      | 專業操作證屆期換證 | 40        | 30 min    | 70         |

## Routing (BrowserRouter)

```
/                      → HomePage
/practice/select       → CategorySelectPage (practice mode)
/practice/:type        → PracticePage
/exam/select           → CategorySelectPage (exam mode)
/exam/:type            → ExamPage
/exam/:type/result     → ExamResultPage
/history               → ExamHistoryPage
/bookmarks             → BookmarksPage
```

Deep-link refreshes on GitHub Pages are handled by `public/404.html` (encodes path into query string) + a decode script in `index.html` (`history.replaceState`).

## localStorage Keys

All prefixed with `dronequiz-`:

- `dronequiz-theme` — ThemeMode ('light' | 'dark' | 'system')
- `dronequiz-consent` — Privacy consent ('true' | 'false')
- `dronequiz-pref-exam-auto-advance` — Auto-advance in exam mode (boolean, default true)
- `dronequiz-pref-practice-show-answer` — Show answer in practice mode (boolean, default true)
- `dronequiz-progress-{type}` — Practice progress (currentIndex)
- `dronequiz-read-{type}` — Read question IDs (number[])
- `dronequiz-bookmarks-{type}` — Bookmarked question IDs (number[])
- `dronequiz-exam-history` — ExamRecord[] (newest first)

All writes (except consent key itself) are guarded by `setStorageItem` which checks consent first.

## Data Pipeline

1. PDF files stored in `public/question/`
2. `scripts/parse-pdf.mjs` extracts text via pdf-parse v2, parses questions + answer keys
3. Outputs JSON to `src/data/*.json` (bundled into the app at build time)
4. `scripts/update-questions.mjs` fetches PDFs from CAA website, then runs parse
5. GitHub Actions runs update weekly (Monday 00:00 UTC), commits if changed
