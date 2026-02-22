import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Flame } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import { COLORS, FONTS, SPACING, QUIZ_CATEGORIES } from '../../constants';
import { useAuthContext } from '../../lib/AuthContext';
import { useQuizStats } from '../../hooks/useQuiz';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function QuizHomeScreen({ navigation }: Props) {
  const { profile } = useAuthContext();
  const { stats, loading, fetchStats, getWeakCategories } = useQuizStats(profile?.id);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchStats();
    });
    return unsubscribe;
  }, [navigation, fetchStats]);

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: SPACING.md }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg }}>
          <View>
            <Text style={{ color: COLORS.white, fontSize: 28, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 28 }}>Study</Text>
            <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.regular, marginTop: 2 }}>
              CDL Permit Prep
            </Text>
          </View>
          {stats.streakCount > 0 && (
            <View
              style={{
                backgroundColor: 'rgba(245,158,11,0.15)',
                borderRadius: 20,
                paddingHorizontal: 14,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Flame size={18} color={COLORS.amber} />
              <Text style={{ color: COLORS.amber, fontFamily: FONTS.semibold, fontSize: 15, marginLeft: 6 }}>
                {stats.streakCount} day streak
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <Card style={{ marginBottom: SPACING.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.amber, fontSize: 28, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 28 }}>
                {stats.overallPercentage}%
              </Text>
              <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, marginTop: 2 }}>Overall</Text>
            </View>
            <View style={{ width: 1, backgroundColor: COLORS.navyMid }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.white, fontSize: 28, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 28 }}>
                {stats.totalAnswered}
              </Text>
              <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, marginTop: 2 }}>Answered</Text>
            </View>
            <View style={{ width: 1, backgroundColor: COLORS.navyMid }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.white, fontSize: 28, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 28 }}>
                {stats.totalCorrect}
              </Text>
              <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, marginTop: 2 }}>Correct</Text>
            </View>
          </View>
        </Card>

        {/* Practice Modes */}
        <Text style={{ color: COLORS.white, fontSize: 18, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 18, marginBottom: SPACING.sm, marginTop: SPACING.xs }}>
          Practice Modes
        </Text>

        <View style={{ gap: SPACING.sm, marginBottom: SPACING.lg }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('DailyPractice')}
            activeOpacity={0.7}
            style={{
              backgroundColor: COLORS.amber,
              borderRadius: 16,
              padding: SPACING.cardPadding,
            }}
          >
            <Text style={{ color: COLORS.navy, fontSize: 18, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 18 }}>
              Daily Practice
            </Text>
            <Text style={{ color: COLORS.navy, fontSize: 13, fontFamily: FONTS.regular, marginTop: 4, opacity: 0.8 }}>
              20 questions from your weak areas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CategorySelect')}
            activeOpacity={0.7}
            style={{
              backgroundColor: COLORS.navyLight,
              borderRadius: 16,
              padding: SPACING.cardPadding,
              borderWidth: 1,
              borderColor: COLORS.navyMid,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 18, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 18 }}>
              Category Drill
            </Text>
            <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular, marginTop: 4 }}>
              Focus on a specific CDL test section
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MockExam')}
            activeOpacity={0.7}
            style={{
              backgroundColor: COLORS.navyLight,
              borderRadius: 16,
              padding: SPACING.cardPadding,
              borderWidth: 1,
              borderColor: COLORS.navyMid,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 18, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 18 }}>
              Mock Exam
            </Text>
            <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular, marginTop: 4 }}>
              50 questions, timed — simulates the real test
            </Text>
          </TouchableOpacity>
        </View>

        {/* Performance by Category */}
        <Text style={{ color: COLORS.white, fontSize: 18, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 18, marginBottom: SPACING.sm }}>
          Performance by Category
        </Text>

        <View style={{ gap: 10 }}>
          {stats.categoryStats.map((cat) => (
            <Card key={cat.category} padding={14}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.medium, flex: 1 }}>
                  {cat.category}
                </Text>
                <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.semibold }}>
                  {cat.total > 0 ? `${cat.percentage}%` : '—'}
                </Text>
              </View>
              <ProgressBar
                progress={cat.total > 0 ? cat.percentage / 100 : 0}
                height={4}
                color={COLORS.amber}
              />
              <Text style={{ color: COLORS.slate, fontSize: 11, fontFamily: FONTS.regular, marginTop: 4 }}>
                {cat.correct}/{cat.total} correct
              </Text>
            </Card>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}
