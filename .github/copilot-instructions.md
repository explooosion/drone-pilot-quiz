# Drone Pilot Quiz — Copilot Instructions

## Project Overview

Taiwan drone pilot exam preparation web app (遙控無人機操作證學科題庫). Built with React 19 + TypeScript + TailwindCSS v4, deployed on GitHub Pages. All state in localStorage, no backend.

## Tech Stack

- **Runtime**: Vite 8 + React 19 + TypeScript (strict, `verbatimModuleSyntax: true`)
- **Compiler**: React Compiler enabled via `@rolldown/plugin-babel` + `babel-plugin-react-compiler`
- **Styling**: TailwindCSS v4 via `@tailwindcss/vite` plugin, using `@theme` directive for custom design tokens
- **Routing**: react-router-dom v7 with `HashRouter` (for GitHub Pages compatibility)
- **Icons**: react-icons (primarily `react-icons/hi` — Heroicons outline)
- **Code Quality**: ESLint + Prettier + Husky + lint-staged

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
  question/                 # Source PDF files (3 banks)
src/
  main.tsx                  # Entry point, HashRouter + ThemeProvider
  App.tsx                   # Route definitions
  index.css                 # Tailwind + @theme design tokens
  types/index.ts            # All TypeScript types
  contexts/
    ThemeContext.tsx         # Theme provider (light/dark/system)
  hooks/
    useLocalStorage.ts      # Generic localStorage hook
    useQuestions.ts          # Load question bank JSON (dynamic import + cache)
    useProgress.ts          # Practice mode progress tracking
    useExam.ts              # Exam state machine (timer, scoring, history)
  components/
    layout/
      Header.tsx            # App header with nav + theme toggle
      Footer.tsx            # Footer with metadata
      MobileMenu.tsx        # Slide-out mobile menu
      Layout.tsx            # Main layout wrapper
      ThemeToggle.tsx       # Light/Dark/System toggle
    quiz/
      QuestionCard.tsx      # Question display card (practice/exam/review modes)
      OptionButton.tsx      # Individual A/B/C/D option
      ProgressBar.tsx       # Progress indicator
      QuestionNav.tsx       # Bottom navigation bar
      Timer.tsx             # Exam countdown timer
    ui/
      AlertDialog.tsx       # Confirmation modal dialog
  pages/
    HomePage.tsx            # Landing / mode selection
    CategorySelectPage.tsx  # Bank type selector
    PracticePage.tsx        # Question bank practice
    ExamPage.tsx            # Mock exam
    ExamResultPage.tsx      # Exam score + review
    ExamHistoryPage.tsx     # Past exam records
    BookmarksPage.tsx       # Bookmarked questions
  utils/
    storage.ts              # localStorage keys + helpers
    exam-config.ts          # Exam parameters per bank type
  data/
    basic.json              # Generated: 普通操作證題庫
    professional.json       # Generated: 專業操作證題庫
    renewal.json            # Generated: 屆期換證題庫
    metadata.json           # Generated: bank metadata
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

## Routing (HashRouter)

```
#/                     → HomePage
#/practice/select      → CategorySelectPage (practice mode)
#/practice/:type       → PracticePage
#/exam/select          → CategorySelectPage (exam mode)
#/exam/:type           → ExamPage
#/exam/:type/result    → ExamResultPage
#/history              → ExamHistoryPage
#/bookmarks            → BookmarksPage
```

## localStorage Keys

All prefixed with `dronequiz-`:

- `dronequiz-theme` — ThemeMode ('light' | 'dark' | 'system')
- `dronequiz-progress-{type}` — Practice progress (currentIndex)
- `dronequiz-read-{type}` — Read question IDs (number[])
- `dronequiz-bookmarks-{type}` — Bookmarked question IDs (number[])
- `dronequiz-exam-history` — ExamRecord[] (newest first)

## Data Pipeline

1. PDF files stored in `public/question/`
2. `scripts/parse-pdf.mjs` extracts text via pdf-parse v2, parses questions + answer keys
3. Outputs JSON to `src/data/*.json` (bundled into the app at build time)
4. `scripts/update-questions.mjs` fetches PDFs from CAA website, then runs parse
5. GitHub Actions runs update weekly (Monday 00:00 UTC), commits if changed
