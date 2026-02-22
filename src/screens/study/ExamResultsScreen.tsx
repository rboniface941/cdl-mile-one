import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { COLORS, FONTS, SPACING } from '../../constants';
import { QuizCategory, Question } from '../../types';
import { useInterstitial } from '../../lib/InterstitialContext';
import ScreenWrapper from '../../components/common/ScreenWrapper';

type ExamResultsRouteParams = {
  ExamResults: {
    score: number;
    total: number;
    timeSeconds: number;
    category: QuizCategory;
    answers: Record<number, string>;
    questions: Question[];
  };
};

interface CategoryBreakdown {
  category: string;
  total: number;
  correct: number;
  percentage: number;
}

export default function ExamResultsScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<ExamResultsRouteParams, 'ExamResults'>>();
  const { score, total, timeSeconds, category, answers, questions } = route.params;
  const { triggerInterstitial } = useInterstitial();

  useEffect(() => {
    triggerInterstitial();
  }, []);

  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  const passed = percentage >= 80;

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const categoryBreakdown = useMemo((): CategoryBreakdown[] => {
    const map: Record<string, { total: number; correct: number }> = {};

    questions.forEach((q) => {
      const cat = q.category;
      if (!map[cat]) {
        map[cat] = { total: 0, correct: 0 };
      }
      map[cat].total += 1;

      const userAnswer = answers[q.id];
      if (userAnswer && userAnswer === q.correct_answer) {
        map[cat].correct += 1;
      }
    });

    return Object.entries(map)
      .map(([cat, data]) => ({
        category: cat,
        total: data.total,
        correct: data.correct,
        percentage: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0,
      }))
      .sort((a, b) => a.percentage - b.percentage);
  }, [questions, answers]);

  const weakAreas = categoryBreakdown.filter((c) => c.percentage < 80);

  return (
    <ScreenWrapper scrollable>
      <View style={styles.container}>
        {/* Score Circle */}
        <View style={styles.circleContainer}>
          <View
            style={[
              styles.scoreCircle,
              {
                borderColor: passed ? COLORS.success : COLORS.error,
              },
            ]}
          >
            <Text style={styles.scorePercentage}>{percentage}%</Text>
          </View>
          <Text
            style={[
              styles.passLabel,
              { color: passed ? COLORS.success : COLORS.error },
            ]}
          >
            {passed ? 'Passed!' : 'Keep Studying'}
          </Text>
        </View>

        {/* Summary */}
        <Text style={styles.summaryText}>
          {score} of {total} correct
        </Text>
        <Text style={styles.summaryText}>Time: {formatTime(timeSeconds)}</Text>

        {/* Category Breakdown */}
        {weakAreas.length > 0 && (
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Weak Areas</Text>
            {categoryBreakdown.map((item) => {
              const barColor =
                item.percentage >= 80 ? COLORS.amber : COLORS.error;
              return (
                <View key={item.category} style={styles.barRow}>
                  <View style={styles.barLabelRow}>
                    <Text style={styles.barCategoryText}>{item.category}</Text>
                    <Text style={[styles.barPercentText, { color: barColor }]}>
                      {item.percentage}%
                    </Text>
                  </View>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${item.percentage}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* All categories if no weak areas */}
        {weakAreas.length === 0 && categoryBreakdown.length > 0 && (
          <View style={styles.breakdownSection}>
            <Text style={styles.breakdownTitle}>Category Breakdown</Text>
            {categoryBreakdown.map((item) => (
              <View key={item.category} style={styles.barRow}>
                <View style={styles.barLabelRow}>
                  <Text style={styles.barCategoryText}>{item.category}</Text>
                  <Text style={[styles.barPercentText, { color: COLORS.amber }]}>
                    {item.percentage}%
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${item.percentage}%`,
                        backgroundColor: COLORS.amber,
                      },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Spacer */}
        <View style={{ flex: 1, minHeight: SPACING.xl }} />

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.reviewButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.reviewButtonText}>Review Answers</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tryAgainButton}
            onPress={() =>
              navigation.replace('ExamSetup', { category })
            }
            activeOpacity={0.8}
          >
            <Text style={styles.tryAgainButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  circleContainer: {
    alignItems: 'center',
    marginTop: SPACING.xl,
    marginBottom: SPACING.md,
  },
  scoreCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scorePercentage: {
    color: COLORS.white,
    fontSize: 44,
    fontFamily: FONTS.semibold,
  },
  passLabel: {
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginTop: SPACING.sm,
  },
  summaryText: {
    color: COLORS.slate,
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: 4,
  },
  breakdownSection: {
    marginTop: SPACING.xl,
  },
  breakdownTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.md,
  },
  barRow: {
    marginBottom: SPACING.md,
  },
  barLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barCategoryText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  barPercentText: {
    fontSize: 14,
    fontFamily: FONTS.semibold,
  },
  barTrack: {
    height: 8,
    backgroundColor: COLORS.navyMid,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
  },
  buttonsContainer: {
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  reviewButton: {
    backgroundColor: COLORS.navyLight,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  reviewButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  tryAgainButton: {
    backgroundColor: COLORS.amber,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  tryAgainButtonText: {
    color: COLORS.navy,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
});
