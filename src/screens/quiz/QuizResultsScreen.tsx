import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function QuizResultsScreen({ navigation, route }: Props) {
  const { score = 0, total = 0, mode = 'daily', category } = route.params || {};
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const getGrade = () => {
    if (percentage >= 90) return { label: 'Excellent!', color: COLORS.success };
    if (percentage >= 80) return { label: 'Passing!', color: COLORS.success };
    if (percentage >= 70) return { label: 'Almost there!', color: COLORS.amber };
    return { label: 'Keep practicing', color: COLORS.error };
  };

  const grade = getGrade();

  const modeLabels: Record<string, string> = {
    daily: 'Daily Practice',
    category: category || 'Category Drill',
    mock: 'Mock Exam',
  };

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        {/* Score Circle */}
        <View
          style={{
            width: 150,
            height: 150,
            borderRadius: 75,
            borderWidth: 5,
            borderColor: grade.color,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Text style={{ color: COLORS.white, fontSize: 44, fontWeight: '800' }}>
            {percentage}%
          </Text>
        </View>

        <Text style={{ color: grade.color, fontSize: 22, fontWeight: '700', marginBottom: 8 }}>
          {grade.label}
        </Text>
        <Text style={{ color: COLORS.gray[400], fontSize: 15 }}>
          {score} out of {total} correct
        </Text>
        <Text style={{ color: COLORS.gray[500], fontSize: 13, marginTop: 4 }}>
          {modeLabels[mode]}
        </Text>

        {mode === 'mock' && (
          <Card style={{ marginTop: 24, width: '100%' }}>
            <Text style={{ color: COLORS.white, fontSize: 14, textAlign: 'center' }}>
              {percentage >= 80
                ? 'You passed! This score would pass the CDL knowledge test in most states.'
                : 'Most states require 80% to pass. Keep studying and try again!'}
            </Text>
          </Card>
        )}

        <View style={{ width: '100%', marginTop: 32, gap: 12 }}>
          <Button
            title="Back to Study"
            onPress={() => navigation.navigate('QuizHome')}
          />
          <Button
            title="Try Again"
            variant="outline"
            onPress={() => {
              navigation.replace('QuizSession', { mode, category });
            }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
