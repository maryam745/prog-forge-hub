

## Plan: Revamp Quiz Module with 3 Quiz Modes + Timer

### Current Flow
Topic selected → AI generates mixed 10 questions (6 MCQ + 4 coding) → single quiz screen.

### New Flow
Topic selected → **Quiz Mode Selection Screen** with 3 options → dedicated quiz with **timer**.

### Changes

#### 1. New Component: `QuizModeScreen.tsx`
After topic selection, show 3 cards:
- **MCQs** — 10 multiple choice questions
- **Short Answers** — 10 one-word/short answer questions (including "find the error in this code" type)
- **Coding Challenges** — 10 coding problems with Run & Test

Each card shows icon, description, and estimated time. Clicking generates the quiz via the edge function with the selected mode.

#### 2. Update Edge Function: `generate-quiz/index.ts`
Accept a new `mode` parameter (`mcq` | `short` | `coding`) and adjust the prompt:
- **mcq mode**: Generate 10 MCQs with 4 options each
- **short mode**: Generate 10 short-answer questions — mix of conceptual one-word answers AND "find the error in this code snippet" questions where the user types the error/fix
- **coding mode**: Generate 10 coding challenges with title, description, example I/O, and hints

Update prompt templates for each mode to ensure topic-relevance.

#### 3. Update `AIQuizScreen.tsx`
- Add **short answer** question type support (text input, case-insensitive matching)
- Add a **countdown timer** at the top:
  - MCQs: 10 minutes
  - Short Answers: 15 minutes
  - Coding: 30 minutes
- Timer shows mm:ss, flashes red under 1 minute
- Auto-submit when timer hits 0
- Show time taken in results screen

#### 4. Update `TopicsScreen.tsx`
- Instead of directly calling `onStartQuiz`, navigate to quiz mode selection screen
- Pass `topic` and `category` to the mode screen

#### 5. Update `Index.tsx`
- Add new screen state `quiz-mode-select`
- Store selected topic/category for the quiz flow
- Wire up navigation: topics → mode select → ai-quiz

#### 6. Timer Implementation Details
- `useEffect` with `setInterval` decrementing seconds
- Pause/cleanup on unmount
- Auto-call finish handler when timer reaches 0
- Display as a sticky bar at the top of the quiz

### Files to Create/Modify
- **Create**: `src/components/QuizModeScreen.tsx`
- **Modify**: `supabase/functions/generate-quiz/index.ts`
- **Modify**: `src/components/AIQuizScreen.tsx`
- **Modify**: `src/components/TopicsScreen.tsx`
- **Modify**: `src/pages/Index.tsx`

