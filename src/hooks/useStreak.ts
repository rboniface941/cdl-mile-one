import { useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useStreak(userId?: string) {
  const updateStreak = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('streak_count, last_practice_date')
        .eq('id', userId)
        .single();

      if (!profile) return;

      const today = new Date().toISOString().split('T')[0];
      const lastPractice = profile.last_practice_date;

      if (lastPractice === today) return; // Already practiced today

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newStreak = 1;
      if (lastPractice === yesterdayStr) {
        newStreak = (profile.streak_count || 0) + 1;
      }

      await supabase
        .from('profiles')
        .update({
          streak_count: newStreak,
          last_practice_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);
    } catch (err) {
      console.error('Error updating streak:', err);
    }
  }, [userId]);

  return { updateStreak };
}
