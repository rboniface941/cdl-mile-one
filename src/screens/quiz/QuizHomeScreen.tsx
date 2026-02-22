import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import { COLORS, QUIZ_CATEGORIES } from '../../constants';
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
      <View style={{ paddingTop: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <View>
            <Text style={{ color: COLORS.white, fontSize: 28, fontWeight: '800' }}>Study</Text>
            <Text style={{ color: COLORS.gray[400], fontSize: 14, marginTop: 2 }}>
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
              <Text style={{ fontSize: 18, marginRight: 6 }}>🔥</Text>
              <Text style={{ color: COLORS.amber, fontWeight: '700', fontSize: 15 }}>
                {stats.streakCount} day streak
              </Text>
            </View>
          )}
        </View>

        {/* Quick Stats */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.amber, fontSize: 28, fontWeight: '800' }}>
                {stats.overallPercentage}%
              </Text>
              <Text style={{ color: COLORS.gray[400], fontSize: 12, marginTop: 2 }}>Overall</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.white, fontSize: 28, fontWeight: '800' }}>
                {stats.totalAnswered}
              </Text>
              <Text style={{ color: COLORS.gray[400], fontSize: 12, marginTop: 2 }}>Answered</Text>
            </View>
            <View style={{ width: 1, backgroundColor: 'rgba(255,255,255,0.1)' }} />
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.white, fontSize: 28, fontWeight: '800' }}>
                {stats.totalCorrect}
              </Text>
              <Text style={{ color: COLORS.gray[400], fontSize: 12, marginTop: 2 }}>Correct</Text>
            </View>
          </View>
        </Card>

        {/* Practice Modes */}
        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 12, marginTop: 8 }}>
          Practice Modes
        </Text>

        <View style={{ gap: 12, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => navigation.navigate('DailyPractice')}
            activeOpacity={0.7}
            style={{
              backgroundColor: COLORS.amber,
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text style={{ color: COLORS.navy, fontSize: 18, fontWeight: '800' }}>
              Daily Practice
            </Text>
            <Text style={{ color: COLORS.navy, fontSize: 13, marginTop: 4, opacity: 0.8 }}>
              20 questions from your weak areas
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('CategorySelect')}
            activeOpacity={0.7}
            style={{
              backgroundColor: COLORS.navyLight,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '800' }}>
              Category Drill
            </Text>
            <Text style={{ color: COLORS.gray[400], fontSize: 13, marginTop: 4 }}>
              Focus on a specific CDL test section
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('MockExam')}
            activeOpacity={0.7}
            style={{
              backgroundColor: COLORS.navyLight,
              borderRadius: 16,
              padding: 20,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.08)',
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '800' }}>
              Mock Exam
            </Text>
            <Text style={{ color: COLORS.gray[400], fontSize: 13, marginTop: 4 }}>
              50 questions, timed — simulates the real test
            </Text>
          </TouchableOpacity>
        </View>

        {/* Performance by Category */}
        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          Performance by Category
        </Text>

        <View style={{ gap: 10 }}>
          {stats.categoryStats.map((cat) => (
            <Card key={cat.category} padding={14}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '600', flex: 1 }}>
                  {cat.category}
                </Text>
                <Text style={{ color: cat.percentage >= 70 ? COLORS.success : cat.total > 0 ? COLORS.error : COLORS.gray[500], fontSize: 14, fontWeight: '700' }}>
                  {cat.total > 0 ? `${cat.percentage}%` : '—'}
                </Text>
              </View>
              <ProgressBar
                progress={cat.total > 0 ? cat.percentage / 100 : 0}
                height={5}
                color={cat.percentage >= 70 ? COLORS.success : COLORS.error}
              />
              <Text style={{ color: COLORS.gray[500], fontSize: 11, marginTop: 4 }}>
                {cat.correct}/{cat.total} correct
              </Text>
            </Card>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}
