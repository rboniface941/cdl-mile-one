import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../../constants';
import { QuizCategory } from '../../types';
import { useQuiz } from '../../hooks/useQuiz';
import { useQuizSessions } from '../../hooks/useQuizSessions';
import { useAuthContext } from '../../lib/AuthContext';
import { useInterstitial } from '../../lib/InterstitialContext';
import ScreenWrapper from '../../components/common/ScreenWrapper';

type PracticeRouteParams = {
  PracticeSession: { category: QuizCategory };
};

export default function PracticeScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<PracticeRouteParams, 'PracticeSession'>>();
  const { category } = route.params;
  const { user } = useAuthContext();
  const quiz = useQuiz(user?.id);
  const { saveSession } = useQuizSessions(user?.id);
  const { triggerInterstitial } = useInterstitial();

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);
  const sessionStartRef = useRef<number>(Date.now());

  useEffect(() => {
    quiz.fetchQuestions({ category });
  }, []);

  useEffect(() => {
    if (quiz.finished) {
      const timeSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
      saveSession({
        category,
        mode: 'practice',
        score: quiz.score,
        total: quiz.questions.length,
        timeSeconds,
        completedAt: new Date().toISOString(),
      });
      navigation.goBack();
    }
  }, [quiz.finished]);

  const handleGoBack = useCallback(() => {
    const timeSeconds = Math.round((Date.now() - sessionStartRef.current) / 1000);
    if (quiz.currentIndex > 0) {
      saveSession({
        category,
        mode: 'practice',
        score: quiz.score,
        total: quiz.currentIndex,
        timeSeconds,
        completedAt: new Date().toISOString(),
      });
    }
    triggerInterstitial();
    navigation.goBack();
  }, [quiz.currentIndex, quiz.score, category, saveSession, triggerInterstitial, navigation]);

  const handleSubmit = useCallback(async () => {
    if (!quiz.currentQuestion || !selectedAnswer) return;

    if (submitted) {
      // "Next Question" was pressed
      setSelectedAnswer(null);
      setSubmitted(false);
      setWasCorrect(false);
      quiz.nextQuestion();
      return;
    }

    const correct = await quiz.answerQuestion(quiz.currentQuestion.id, selectedAnswer);
    setWasCorrect(correct);
    setSubmitted(true);
  }, [quiz, selectedAnswer, submitted]);

  const handleScore = () => {
    const total = quiz.currentIndex + (submitted ? 1 : 0);
    const pct = total > 0 ? Math.round((quiz.score / total) * 100) : 0;
    Alert.alert('Score', `${quiz.score} / ${total} correct (${pct}%)`);
  };

  const handleGoto = () => {
    Alert.alert(
      'Go to Question',
      `Currently on question ${quiz.currentIndex + 1} of ${quiz.questions.length}.`
    );
  };

  const getOptionText = (letter: string): string => {
    if (!quiz.currentQuestion) return '';
    const map: Record<string, string> = {
      A: quiz.currentQuestion.option_a,
      B: quiz.currentQuestion.option_b,
      C: quiz.currentQuestion.option_c,
      D: quiz.currentQuestion.option_d,
    };
    return map[letter] || '';
  };

  const getCircleStyle = (letter: string) => {
    if (!submitted) {
      if (selectedAnswer === letter) {
        return { borderColor: COLORS.amber, backgroundColor: COLORS.amber };
      }
      return { borderColor: COLORS.slate, backgroundColor: 'transparent' };
    }

    // After submission
    const correctAnswer = quiz.currentQuestion?.correct_answer;
    if (letter === correctAnswer) {
      return { borderColor: COLORS.amber, backgroundColor: COLORS.amber };
    }
    if (letter === selectedAnswer && !wasCorrect) {
      return {
        borderColor: 'rgba(239,68,68,0.6)',
        backgroundColor: 'rgba(239,68,68,0.6)',
      };
    }
    return { borderColor: COLORS.slate, backgroundColor: 'transparent' };
  };

  const getTextColor = (letter: string) => {
    if (!submitted) {
      return selectedAnswer === letter ? COLORS.amber : COLORS.white;
    }
    const correctAnswer = quiz.currentQuestion?.correct_answer;
    if (letter === correctAnswer) return COLORS.amber;
    if (letter === selectedAnswer && !wasCorrect) return 'rgba(239,68,68,0.6)';
    return COLORS.white;
  };

  if (quiz.loading) {
    return (
      <ScreenWrapper scrollable={false}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.amber} />
        </View>
      </ScreenWrapper>
    );
  }

  if (!quiz.currentQuestion) {
    return (
      <ScreenWrapper scrollable={false}>
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>No questions available for this category.</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const options = ['A', 'B', 'C', 'D'];
  const scorePct =
    quiz.currentIndex > 0
      ? Math.round((quiz.score / quiz.currentIndex) * 100)
      : 0;

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Nav Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity onPress={handleGoBack} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Practice</Text>
          <View style={styles.navRight}>
            <TouchableOpacity onPress={handleScore}>
              <Text style={styles.navAction}>Score</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoto}>
              <Text style={styles.navAction}>Goto</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Progress Info */}
        <View style={styles.progressRow}>
          <Text style={styles.progressText}>
            Question {quiz.currentIndex + 1} of {quiz.questions.length}
          </Text>
          <Text style={styles.progressText}>{scorePct}%</Text>
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>
          {quiz.currentQuestion.question_text}
        </Text>

        {/* Answer Options */}
        <View style={styles.optionsContainer}>
          {options.map((letter) => {
            const circleStyle = getCircleStyle(letter);
            const textColor = getTextColor(letter);
            const isDisabled = submitted;

            return (
              <TouchableOpacity
                key={letter}
                style={styles.optionRow}
                onPress={() => !isDisabled && setSelectedAnswer(letter)}
                activeOpacity={isDisabled ? 1 : 0.7}
                disabled={isDisabled}
              >
                <View style={[styles.optionCircle, circleStyle]} />
                <Text style={[styles.optionText, { color: textColor }]}>
                  {getOptionText(letter)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Explanation */}
        {submitted && quiz.currentQuestion.explanation && (
          <Text style={styles.explanation}>
            {quiz.currentQuestion.explanation}
          </Text>
        )}

        {/* Submit / Next Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            !selectedAnswer && !submitted && { opacity: 0.4 },
          ]}
          onPress={handleSubmit}
          disabled={!selectedAnswer && !submitted}
          activeOpacity={0.7}
        >
          <Text style={styles.submitButtonText}>
            {submitted ? 'Next Question' : 'Submit'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: COLORS.slate,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  navTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  navRight: {
    flexDirection: 'row',
    gap: 16,
  },
  navAction: {
    color: COLORS.slate,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  progressText: {
    color: COLORS.slate,
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  questionText: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: FONTS.regular,
    marginTop: SPACING.xl,
    lineHeight: 30,
  },
  optionsContainer: {
    marginTop: SPACING.xl,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  optionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    marginRight: SPACING.sm,
    marginTop: 2,
  },
  optionText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    flex: 1,
    lineHeight: 24,
  },
  explanation: {
    color: COLORS.slate,
    fontSize: 14,
    fontFamily: FONTS.regular,
    lineHeight: 22,
    marginBottom: SPACING.lg,
    paddingTop: SPACING.xs,
  },
  submitButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.lg,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
});
