import React, { createContext, useContext, useState, ReactNode } from 'react';
import { CDLStage } from '../types';

interface OnboardingState {
  stage: CDLStage | null;
  quizScore: number;
  quizTotal: number;
  completed: boolean;
}

interface OnboardingContextType {
  state: OnboardingState;
  setStage: (stage: CDLStage) => void;
  setQuizResults: (score: number, total: number) => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OnboardingState>({
    stage: null,
    quizScore: 0,
    quizTotal: 0,
    completed: false,
  });

  const setStage = (stage: CDLStage) => {
    setState(prev => ({ ...prev, stage }));
  };

  const setQuizResults = (score: number, total: number) => {
    setState(prev => ({ ...prev, quizScore: score, quizTotal: total }));
  };

  const completeOnboarding = () => {
    setState(prev => ({ ...prev, completed: true }));
  };

  return (
    <OnboardingContext.Provider value={{ state, setStage, setQuizResults, completeOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}
