import React, { useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { X } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ProgressBar from '../../components/common/ProgressBar';
import Button from '../../components/common/Button';
import { COLORS, FONTS, SPACING, DAILY_PRACTICE_COUNT, MOCK_EXAM_COUNT, MOCK_EXAM_MINUTES } from '../../constants';
import { useQuiz, useQuizStats } from '../../hooks/useQuiz';
import { useStreak } from '../../hooks/useStreak';
import { useAuthContext } from '../../lib/AuthContext';
import { QuizCategory } from '../../types';

type QuizMode = 'daily' | 'category' | 'mock';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function QuizSessionScreen({ navigation, route }: Props) {
  const mode: QuizMode = route.params?.mode || 'daily';
  const category: QuizCategory | undefined = route.params?.category;

  const { profile } = useAuthContext();
  const quiz = useQuiz(profile?.id);
  const { getWeakCategories } = useQuizStats(profile?.id);
  const { updateStreak } = useStreak(profile?.id);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const [timeLeft, setTimeLeft] = useState(mode === 'mock' ? MOCK_EXAM_MINUTES * 60 : 0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const loadQuiz = async () => {
      if (mode === 'daily') {
        const weakCats = getWeakCategories();
        await quiz.fetchQuestions({
          count: DAILY_PRACTICE_COUNT,
          weakCategories: weakCats.length > 0 ? weakCats : undefined,
        });
      } else if (mode === 'category' && category) {
        await quiz.fetchQuestions({ category });
      } else if (mode === 'mock') {
        await quiz.fetchQuestions({ count: MOCK_EXAM_COUNT });
      }
    };
    loadQuiz();
  }, []);

  // Timer for mock exam
  useEffect(() => {
    if (mode === 'mock' && !quiz.finished) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            Alert.alert('Time Up!', 'Your mock exam time has expired.');
            navigation.navigate('QuizResults', {
              score: quiz.score,
              total: quiz.questions.length,
              mode,
            });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [mode, quiz.finished]);

  useEffect(() => {
    if (quiz.finished) {
      if (timerRef.current) clearInterval(timerRef.current);
      updateStreak();
      navigation.replace('QuizResults', {
        score: quiz.score,
        total: quiz.questions.length,
        mode,
        category,
      });
    }
  }, [quiz.finished]);

  const handleAnswer = async (answer: string) => {
    if (showFeedback || !quiz.currentQuestion) return;
    setSelectedAnswer(answer);
    const correct = await quiz.answerQuestion(quiz.currentQuestion.id, answer);
    setWasCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    quiz.nextQuestion();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (quiz.loading || !quiz.currentQuestion) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.slate, fontSize: 16, fontFamily: FONTS.regular }}>Loading questions...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const options = [
    { key: 'A', text: quiz.currentQuestion.option_a },
    { key: 'B', text: quiz.currentQuestion.option_b },
    { key: 'C', text: quiz.currentQuestion.option_c },
    { key: 'D', text: quiz.currentQuestion.option_d },
  ];

  const modeLabels: Record<QuizMode, string> = {
    daily: 'Daily Practice',
    category: category || 'Category Drill',
    mock: 'Mock Exam',
  };

  return (
    <ScreenWrapper>
      {/* Header Bar */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SPACING.xs }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ flexDirection: 'row', alignItems: 'center' }}>
          <X size={20} color={COLORS.slate} />
          <Text style={{ color: COLORS.slate, fontSize: 16, fontFamily: FONTS.medium, marginLeft: 4 }}>Exit</Text>
        </TouchableOpacity>
        <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.medium }}>
          {modeLabels[mode]}
        </Text>
        {mode === 'mock' ? (
          <Text style={{ color: timeLeft < 300 ? COLORS.error : COLORS.amber, fontSize: 16, fontFamily: FONTS.semibold }}>
            {formatTime(timeLeft)}
          </Text>
        ) : (
          <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.regular }}>
            {quiz.score}/{quiz.currentIndex + (showFeedback ? 1 : 0)}
          </Text>
        )}
      </View>

      {/* Progress */}
      <ProgressBar progress={quiz.progress} height={5} style={{ marginTop: SPACING.sm, marginBottom: 4 }} />
      <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, textAlign: 'right', marginBottom: SPACING.md }}>
        {quiz.currentIndex + 1} of {quiz.questions.length}
      </Text>

      {/* Category badge */}
      <View
        style={{
          alignSelf: 'flex-start',
          backgroundColor: 'rgba(245,158,11,0.12)',
          borderRadius: 8,
          paddingHorizontal: 10,
          paddingVertical: 4,
          marginBottom: SPACING.sm,
        }}
      >
        <Text style={{ color: COLORS.amber, fontSize: 12, fontFamily: FONTS.medium }}>
          {quiz.currentQuestion.category}
        </Text>
      </View>

      {/* Question */}
      <Text style={{ color: COLORS.white, fontSize: 19, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 19, lineHeight: 28, marginBottom: SPACING.lg }}>
        {quiz.currentQuestion.question_text}
      </Text>

      {/* Options */}
      <View style={{ gap: 10 }}>
        {options.map((option) => {
          const isSelected = selectedAnswer === option.key;
          const isCorrect = option.key === quiz.currentQuestion!.correct_answer;
          let bgColor = COLORS.navyLight;
          let borderColor = COLORS.navyMid;

          if (showFeedback) {
            if (isCorrect) {
              bgColor = 'rgba(34, 197, 94, 0.15)';
              borderColor = COLORS.success;
            } else if (isSelected && !isCorrect) {
              bgColor = 'rgba(239, 68, 68, 0.15)';
              borderColor = COLORS.error;
            }
          } else if (isSelected) {
            borderColor = COLORS.amber;
          }

          return (
            <TouchableOpacity
              key={option.key}
              onPress={() => handleAnswer(option.key)}
              disabled={showFeedback}
              activeOpacity={0.7}
              style={{
                backgroundColor: bgColor,
                borderWidth: 1,
                borderColor,
                borderRadius: 14,
                padding: SPACING.md,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: isSelected && !showFeedback ? COLORS.amber : 'rgba(255,255,255,0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.sm,
                }}
              >
                <Text style={{ color: isSelected && !showFeedback ? COLORS.navy : COLORS.white, fontFamily: FONTS.semibold, fontSize: 13 }}>
                  {option.key}
                </Text>
              </View>
              <Text style={{ color: COLORS.white, fontSize: 15, fontFamily: FONTS.regular, flex: 1, lineHeight: 21 }}>
                {option.text}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback */}
      {showFeedback && (
        <View style={{ marginTop: SPACING.cardPadding }}>
          <View
            style={{
              backgroundColor: wasCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              borderRadius: 12,
              padding: 14,
              marginBottom: SPACING.md,
            }}
          >
            <Text style={{ color: wasCorrect ? COLORS.success : COLORS.error, fontSize: 14, fontFamily: FONTS.semibold, marginBottom: 4 }}>
              {wasCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
            {quiz.currentQuestion.explanation && (
              <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular, lineHeight: 19 }}>
                {quiz.currentQuestion.explanation}
              </Text>
            )}
          </View>
          <Button title="Next" onPress={handleNext} />
        </View>
      )}
    </ScreenWrapper>
  );
}
