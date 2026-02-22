import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import ProgressBar from '../../components/common/ProgressBar';
import Button from '../../components/common/Button';
import { COLORS, ONBOARDING_QUIZ_COUNT } from '../../constants';
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
          <Text style={{ color: COLORS.gray[400], fontSize: 16 }}>Loading questions...</Text>
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
      <View style={{ marginTop: 16, marginBottom: 8 }}>
        <ProgressBar progress={progress} height={6} />
        <Text
          style={{
            color: COLORS.gray[400],
            fontSize: 13,
            textAlign: 'right',
            marginTop: 6,
          }}
        >
          {currentIndex + 1} of {questions.length}
        </Text>
      </View>

      {/* Question */}
      <View style={{ marginTop: 16, marginBottom: 24 }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 20,
            fontWeight: '700',
            lineHeight: 28,
          }}
        >
          {currentQuestion.question_text}
        </Text>
      </View>

      {/* Options */}
      <View style={{ gap: 12 }}>
        {options.map((option) => {
          const isSelected = selectedAnswer === option.key;
          const isCorrect = option.key === currentQuestion.correct_answer;
          let bgColor = COLORS.navyLight;
          let borderColor = 'rgba(255,255,255,0.08)';

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
                borderWidth: 1.5,
                borderColor,
                borderRadius: 14,
                padding: 16,
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
                    fontWeight: '700',
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
        <View style={{ marginTop: 20 }}>
          <View
            style={{
              backgroundColor: wasCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              borderRadius: 12,
              padding: 16,
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                color: wasCorrect ? COLORS.success : COLORS.error,
                fontSize: 15,
                fontWeight: '700',
                marginBottom: 6,
              }}
            >
              {wasCorrect ? 'Correct!' : 'Incorrect'}
            </Text>
            {currentQuestion.explanation && (
              <Text style={{ color: COLORS.gray[300], fontSize: 14, lineHeight: 20 }}>
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
