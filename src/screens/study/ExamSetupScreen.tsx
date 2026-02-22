import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS, FONTS, SPACING } from '../../constants';
import { QuizCategory } from '../../types';
import { useQuizSessions } from '../../hooks/useQuizSessions';
import { useAuthContext } from '../../lib/AuthContext';
import ScreenWrapper from '../../components/common/ScreenWrapper';

type ExamSetupRouteParams = {
  ExamSetup: { category: QuizCategory };
};

const QUESTION_OPTIONS = [25, 50, 75, 100];
const DEFAULT_INDEX = 1; // 50 questions

export default function ExamSetupScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const route = useRoute<RouteProp<ExamSetupRouteParams, 'ExamSetup'>>();
  const { category } = route.params;
  const { user } = useAuthContext();
  const { getStatsForCategory, resetStats } = useQuizSessions(user?.id);

  const [selectedIndex, setSelectedIndex] = useState(DEFAULT_INDEX);

  const stats = getStatsForCategory(category);
  const questionCount = QUESTION_OPTIONS[selectedIndex];
  const timeMinutes = Math.round(questionCount * 1.2);

  const handleResetStats = () => {
    Alert.alert(
      'Reset Stats',
      `Are you sure you want to reset all stats for ${category}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => resetStats(category),
        },
      ]
    );
  };

  const handleStartExam = () => {
    navigation.navigate('ExamSession', {
      category,
      questionCount,
      timeMinutes,
    });
  };

  const formatAvgTime = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    return `${minutes}m`;
  };

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        {/* Nav Bar */}
        <View style={styles.navBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={24} color={COLORS.white} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Exam</Text>
          <TouchableOpacity onPress={handleResetStats}>
            <Text style={styles.resetText}>Reset Stats</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.avgLabel}>Avg Score</Text>
          <Text style={styles.avgValue}>{stats.avgExamScore}%</Text>
          <View style={styles.statsRow}>
            <Text style={styles.statDetail}>{stats.examAttempts} attempts</Text>
            <Text style={styles.statDetail}>
              Avg time: {formatAvgTime(stats.avgExamTime)}
            </Text>
          </View>
        </View>

        {/* Question Count Selector */}
        <View style={styles.selectorContainer}>
          {/* Track */}
          <View style={styles.track}>
            <View
              style={[
                styles.trackFill,
                {
                  width:
                    selectedIndex === 0
                      ? 0
                      : `${(selectedIndex / (QUESTION_OPTIONS.length - 1)) * 100}%`,
                },
              ]}
            />
          </View>

          {/* Markers */}
          <View style={styles.markersRow}>
            {QUESTION_OPTIONS.map((count, index) => {
              const isActive = index <= selectedIndex;
              const leftPercent =
                QUESTION_OPTIONS.length > 1
                  ? (index / (QUESTION_OPTIONS.length - 1)) * 100
                  : 0;

              return (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.markerWrapper,
                    { left: `${leftPercent}%` },
                  ]}
                  onPress={() => setSelectedIndex(index)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <View
                    style={[
                      styles.marker,
                      {
                        backgroundColor: isActive
                          ? COLORS.amber
                          : COLORS.navyMid,
                      },
                    ]}
                  />
                  <Text style={styles.markerLabel}>{count}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Time Info */}
        <Text style={styles.timeInfo}>
          {timeMinutes} minutes to complete {questionCount} questions
        </Text>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Start Button */}
        <TouchableOpacity
          style={styles.startButton}
          onPress={handleStartExam}
          activeOpacity={0.8}
        >
          <Text style={styles.startButtonText}>START EXAM</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
  },
  navTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.semibold,
  },
  resetText: {
    color: COLORS.slate,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  statsCard: {
    backgroundColor: COLORS.navyLight,
    borderRadius: 16,
    padding: SPACING.lg,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  avgLabel: {
    color: COLORS.slate,
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginBottom: SPACING.xs,
  },
  avgValue: {
    color: COLORS.amber,
    fontSize: 48,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.lg,
  },
  statDetail: {
    color: COLORS.slate,
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  selectorContainer: {
    height: 80,
    marginBottom: SPACING.md,
    marginHorizontal: SPACING.sm,
    position: 'relative',
  },
  track: {
    position: 'absolute',
    top: 12,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: COLORS.navyMid,
    borderRadius: 2,
  },
  trackFill: {
    height: '100%',
    backgroundColor: COLORS.amber,
    borderRadius: 2,
  },
  markersRow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  markerWrapper: {
    position: 'absolute',
    alignItems: 'center',
    marginLeft: -14,
  },
  marker: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  markerLabel: {
    color: COLORS.slate,
    fontSize: 13,
    fontFamily: FONTS.regular,
    marginTop: 6,
  },
  timeInfo: {
    color: COLORS.slate,
    fontSize: 14,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  startButton: {
    backgroundColor: COLORS.amber,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    marginBottom: SPACING.md,
  },
  startButtonText: {
    color: COLORS.navy,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    textTransform: 'uppercase',
  },
});
