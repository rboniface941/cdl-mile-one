import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useAuthContext } from './AuthContext';
import { supabase } from './supabase';
import { INTERSTITIAL_QUESTIONS } from '../constants';
import { DriverProfile } from '../types';

interface InterstitialContextType {
  shouldShowInterstitial: boolean;
  currentQuestion: typeof INTERSTITIAL_QUESTIONS[number] | null;
  shownThisSession: boolean;
  triggerInterstitial: () => void;
  submitAnswer: (value: any) => Promise<void>;
  dismissInterstitial: () => void;
  interstitialIndex: number;
}

const InterstitialContext = createContext<InterstitialContextType | undefined>(undefined);

export function InterstitialProvider({ children }: { children: ReactNode }) {
  const { profile, updateProfile, refreshProfile } = useAuthContext();
  const [shownThisSession, setShownThisSession] = useState(false);
  const [showingInterstitial, setShowingInterstitial] = useState(false);

  const interstitialIndex = profile?.current_interstitial_index || 0;
  const currentQuestion = interstitialIndex < INTERSTITIAL_QUESTIONS.length
    ? INTERSTITIAL_QUESTIONS[interstitialIndex]
    : null;

  const triggerInterstitial = useCallback(() => {
    if (shownThisSession) return;
    if (!currentQuestion) return;
    setShowingInterstitial(true);
  }, [shownThisSession, currentQuestion]);

  const dismissInterstitial = useCallback(() => {
    setShowingInterstitial(false);
    setShownThisSession(true);
  }, []);

  const submitAnswer = useCallback(async (value: any) => {
    if (!profile?.id || !currentQuestion) return;

    try {
      // Map interstitial answer to driver_profiles fields
      const updates: Partial<DriverProfile> = {};

      switch (currentQuestion.field) {
        case 'state_issued':
          updates.state_issued = value;
          break;
        case 'cdl_class':
          updates.cdl_class = value.replace('Class ', '') as 'A' | 'B' | 'C';
          break;
        case 'endorsements':
          updates.endorsements = Array.isArray(value) ? value.filter((v: string) => v !== 'None') : [];
          break;
        case 'job_type':
          updates.job_type = value as 'OTR' | 'Regional' | 'Local';
          break;
        case 'home_zip':
          updates.current_address = { street: '', city: '', state: '', zip: value };
          break;
        case 'experience_level': {
          const expMap: Record<string, { months: number; graduate: boolean }> = {
            'Fresh Graduate': { months: 0, graduate: true },
            'Under 1 Year': { months: 6, graduate: false },
            '1-2 Years': { months: 18, graduate: false },
            '2+ Years': { months: 36, graduate: false },
          };
          const exp = expMap[value] || { months: 0, graduate: true };
          updates.months_experience = exp.months;
          updates.is_fresh_graduate = exp.graduate;
          break;
        }
        case 'equipment_preference':
          updates.equipment_preference = Array.isArray(value) ? value : [];
          break;
        case 'profile_ready':
          // No driver profile update, just advance the index
          break;
      }

      // Upsert driver profile if there are updates
      if (Object.keys(updates).length > 0) {
        await supabase.from('driver_profiles').upsert({
          id: profile.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      }

      // Advance interstitial index
      const newIndex = interstitialIndex + 1;
      await updateProfile({
        current_interstitial_index: newIndex,
        profile_completeness: calculateCompleteness(newIndex),
      });

      setShowingInterstitial(false);
      setShownThisSession(true);
      refreshProfile();
    } catch (err) {
      console.error('Error saving interstitial answer:', err);
      setShowingInterstitial(false);
      setShownThisSession(true);
    }
  }, [profile?.id, currentQuestion, interstitialIndex, updateProfile, refreshProfile]);

  return (
    <InterstitialContext.Provider
      value={{
        shouldShowInterstitial: showingInterstitial,
        currentQuestion: showingInterstitial ? currentQuestion : null,
        shownThisSession,
        triggerInterstitial,
        submitAnswer,
        dismissInterstitial,
        interstitialIndex,
      }}
    >
      {children}
    </InterstitialContext.Provider>
  );
}

export function useInterstitial() {
  const context = useContext(InterstitialContext);
  if (context === undefined) {
    throw new Error('useInterstitial must be used within an InterstitialProvider');
  }
  return context;
}

function calculateCompleteness(interstitialIndex: number): number {
  // Light fields (interstitials 0-6): ~8% each = 56% max
  const lightScore = Math.min(interstitialIndex, 7) * 8;
  // Heavy fields add remaining 44% (filled through ProfileBuilder)
  return Math.min(lightScore, 100);
}
