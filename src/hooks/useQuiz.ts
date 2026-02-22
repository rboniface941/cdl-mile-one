import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Question, UserAnswer, CategoryStats, QuizCategory } from '../types';
import { QUIZ_CATEGORIES } from '../constants';

export function useQuiz(userId?: string) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);

  const fetchQuestions = async (options?: {
    count?: number;
    category?: QuizCategory;
    weakCategories?: QuizCategory[];
  }) => {
    setLoading(true);
    setCurrentIndex(0);
    setScore(0);
    setAnswers({});
    setFinished(false);

    try {
      let query = supabase.from('questions').select('*');

      if (options?.category) {
        query = query.eq('category', options.category);
      }

      if (options?.weakCategories && options.weakCategories.length > 0) {
        query = query.in('category', options.weakCategories);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Shuffle and limit
      const shuffled = (data || []).sort(() => Math.random() - 0.5);
      const limited = options?.count ? shuffled.slice(0, options.count) : shuffled;
      setQuestions(limited);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = async (questionId: number, selectedAnswer: string) => {
    const question = questions.find(q => q.id === questionId);
    if (!question) return false;

    const wasCorrect = selectedAnswer === question.correct_answer;

    setAnswers(prev => ({ ...prev, [questionId]: selectedAnswer }));
    if (wasCorrect) setScore(prev => prev + 1);

    // Save to database if user is logged in
    if (userId) {
      try {
        await supabase.from('user_answers').insert({
          user_id: userId,
          question_id: questionId,
          selected_answer: selectedAnswer,
          was_correct: wasCorrect,
        });
      } catch (err) {
        console.error('Error saving answer:', err);
      }
    }

    return wasCorrect;
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setFinished(true);
    }
  };

  const currentQuestion = questions[currentIndex] || null;
  const progress = questions.length > 0 ? (currentIndex + 1) / questions.length : 0;
  const answeredCurrent = currentQuestion ? answers[currentQuestion.id] !== undefined : false;

  return {
    questions,
    currentQuestion,
    currentIndex,
    score,
    answers,
    loading,
    finished,
    progress,
    answeredCurrent,
    fetchQuestions,
    answerQuestion,
    nextQuestion,
  };
}

export function useQuizStats(userId?: string) {
  const [stats, setStats] = useState<{
    totalAnswered: number;
    totalCorrect: number;
    overallPercentage: number;
    categoryStats: CategoryStats[];
    streakCount: number;
  }>({
    totalAnswered: 0,
    totalCorrect: 0,
    overallPercentage: 0,
    categoryStats: [],
    streakCount: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    try {
      // Fetch all user answers with question data
      const { data: answersData, error } = await supabase
        .from('user_answers')
        .select('*, questions(*)')
        .eq('user_id', userId);

      if (error) throw error;

      const allAnswers = answersData || [];
      const totalAnswered = allAnswers.length;
      const totalCorrect = allAnswers.filter(a => a.was_correct).length;

      // Calculate category stats
      const categoryMap: Record<string, { total: number; correct: number }> = {};
      QUIZ_CATEGORIES.forEach(cat => {
        categoryMap[cat] = { total: 0, correct: 0 };
      });

      allAnswers.forEach((answer: any) => {
        const category = answer.questions?.category;
        if (category && categoryMap[category]) {
          categoryMap[category].total++;
          if (answer.was_correct) categoryMap[category].correct++;
        }
      });

      const categoryStats: CategoryStats[] = QUIZ_CATEGORIES.map(category => ({
        category,
        total: categoryMap[category].total,
        correct: categoryMap[category].correct,
        percentage: categoryMap[category].total > 0
          ? Math.round((categoryMap[category].correct / categoryMap[category].total) * 100)
          : 0,
      }));

      // Fetch streak
      const { data: profileData } = await supabase
        .from('profiles')
        .select('streak_count')
        .eq('id', userId)
        .single();

      setStats({
        totalAnswered,
        totalCorrect,
        overallPercentage: totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0,
        categoryStats,
        streakCount: profileData?.streak_count || 0,
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const getWeakCategories = (): QuizCategory[] => {
    return stats.categoryStats
      .filter(s => s.total > 0 && s.percentage < 70)
      .sort((a, b) => a.percentage - b.percentage)
      .map(s => s.category);
  };

  return { stats, loading, fetchStats, getWeakCategories };
}
