import { useState, useCallback, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { QuizCategory, QuizSession } from '../types';

const SESSIONS_KEY = 'quiz_sessions';

export function useQuizSessions(userId?: string) {
  const [sessions, setSessions] = useState<QuizSession[]>([]);

  useEffect(() => {
    loadSessions();
  }, [userId]);

  const loadSessions = useCallback(async () => {
    try {
      const key = `${SESSIONS_KEY}_${userId || 'anon'}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setSessions(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading sessions:', err);
    }
  }, [userId]);

  const saveSession = useCallback(async (session: Omit<QuizSession, 'id'>) => {
    try {
      const newSession: QuizSession = {
        ...session,
        id: `${Date.now()}_${Math.random().toString(36).slice(2)}`,
      };
      const key = `${SESSIONS_KEY}_${userId || 'anon'}`;
      const updated = [...sessions, newSession];
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      setSessions(updated);
      return newSession;
    } catch (err) {
      console.error('Error saving session:', err);
      return null;
    }
  }, [userId, sessions]);

  const getStatsForCategory = useCallback((category: QuizCategory) => {
    const categorySessions = sessions.filter(
      s => s.category === category
    );
    const examSessions = categorySessions.filter(s => s.mode === 'exam');
    const practiceSessions = categorySessions.filter(s => s.mode === 'practice');

    const examAttempts = examSessions.length;
    const avgExamScore = examAttempts > 0
      ? Math.round(examSessions.reduce((sum, s) => sum + (s.total > 0 ? (s.score / s.total) * 100 : 0), 0) / examAttempts)
      : 0;
    const avgExamTime = examAttempts > 0
      ? Math.round(examSessions.reduce((sum, s) => sum + s.timeSeconds, 0) / examAttempts)
      : 0;

    const practiceAnswered = practiceSessions.reduce((sum, s) => sum + s.total, 0);
    const practiceCorrect = practiceSessions.reduce((sum, s) => sum + s.score, 0);

    const totalStudyTime = categorySessions.reduce((sum, s) => sum + s.timeSeconds, 0);

    return {
      examAttempts,
      avgExamScore,
      avgExamTime,
      practiceAnswered,
      practiceCorrect,
      totalStudyTime,
    };
  }, [sessions]);

  const resetStats = useCallback(async (category: QuizCategory) => {
    try {
      const key = `${SESSIONS_KEY}_${userId || 'anon'}`;
      const updated = sessions.filter(s => s.category !== category);
      await AsyncStorage.setItem(key, JSON.stringify(updated));
      setSessions(updated);
    } catch (err) {
      console.error('Error resetting stats:', err);
    }
  }, [userId, sessions]);

  return {
    sessions,
    saveSession,
    getStatsForCategory,
    resetStats,
    loadSessions,
  };
}
