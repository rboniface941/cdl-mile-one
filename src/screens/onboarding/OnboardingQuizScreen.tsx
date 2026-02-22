import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ProgressBar from '../../components/common/ProgressBar';
import Button from '../../components/common/Button';
import { COLORS, FONTS, SPACING, ONBOARDING_QUIZ_COUNT } from '../../constants';
import { useQuiz } from '../../hooks/useQuiz';
import { useOnboarding } from '../../lib/OnboardingContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function OnboardingQuizScreen({ navigation }: Props) {
  const { fetchQuestions, currentQuestion, currentIndex, score, answers, progress, finished, answerQuestion, nextQuestion, questions, loading } = useQuiz();
  const { setQuizResults } = useOnboarding();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  useEffect(() => {
    fetchQuestions({ count: ONBOARDING_QUIZ_COUNT });
  }, []);

  useEffect(() => {
    if (finished) {
      setQuizResults(score, questions.length);
      navigation.navigate('OnboardingResults');
    }
  }, [finished]);

  const handleAnswer = async (answer: string) => {
    if (showFeedback || !currentQuestion) return;
    setSelectedAnswer(answer);
    const correct = await answerQuestion(currentQuestion.id, answer);
    setWasCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    nextQuestion();
  };

  if (loading || !currentQuestion) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: COLORS.slate, fontSize: 16, fontFamily: FONTS.regular }}>Loading questions...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const options = [
    { key: 'A', text: currentQuestion.option_a },
    { key: 'B', text: currentQuestion.option_b },
    { key: 'C', text: currentQuestion.option_c },
    { key: 'D', text: currentQuestion.option_d },
  ];

  return (
    <ScreenWrapper>
      {/* Progress */}
      <View style={{ marginTop: SPACING.md, marginBottom: SPACING.xs }}>
        <ProgressBar progress={progress} />
        <Text
          style={{
            color: COLORS.slate,
            fontSize: 13,
            fontFamily: FONTS.regular,
            textAlign: 'right',
            marginTop: 6,
          }}
        >
          {currentIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Question */}
      <View style={{ marginTop: SPACING.md, marginBottom: SPACING.lg }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 20,
            fontFamily: FONTS.semibold,
            lineHeight: 28,
            letterSpacing: -0.02 * 20,
          }}
        >
          {currentQuestion.question_text}
        </Text>
      </View>

      {/* Options */}
      <View style={{ gap: SPACING.sm }}>
        {options.map((option) => {
          const isSelected = selectedAnswer === option.key;
          const isCorrect = option.key === currentQuestion.correct_answer;
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
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: isSelected && !showFeedback ? COLORS.amber : 'rgba(255,255,255,0.1)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 14,
                }}
              >
                <Text
                  style={{
                    color: isSelected && !showFeedback ? COLORS.navy : COLORS.white,
                    fontFamily: FONTS.semibold,
                    fontSize: 14,
                  }}
                >
                  {option.key}
                </Text>
              </View>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 15,
                  fontFamily: FONTS.regular,
                  flex: 1,
                  lineHeight: 22,
                }}
              >
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
              padding: SPACING.md,
              marginBottom: SPACING.md,
            }}
          >
            <Text
              style={{
                color: wasCorrect ? COLORS.success : COLORS.error,
                fontSize: 15,
                fontFamily: FONTS.semibold,
                marginBottom: 6,
              }}
            >
              {wasCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
            {currentQuestion.explanation && (
              <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.regular, lineHeight: 20 }}>
                {currentQuestion.explanation}
              </Text>
            )}
          </View>

          <Button title="Next Question" onPress={handleNext} />
        </View>
      )}
    </ScreenWrapper>
  );
}
