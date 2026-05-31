"use client";

import { NavbarPill } from "./components/navbar";
import { QuizSheet } from "./components/quiz-sheet";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <QuizSheet>
      <NavbarPill />
      {children}
    </QuizSheet>
  );
}
