"use client";

import { useState } from "react";
import { Navbar } from "./components/navbar";
import { QuizSheet } from "./components/quiz-sheet";

export function LayoutShell({ children }: { children: React.ReactNode }) {
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <QuizSheet presented={sheetOpen} onPresentedChange={setSheetOpen}>
      <Navbar />
      {children}
    </QuizSheet>
  );
}
