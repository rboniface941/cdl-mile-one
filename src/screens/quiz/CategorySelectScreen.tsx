import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { COLORS, QUIZ_CATEGORIES } from '../../constants';
import { QuizCategory } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const categoryIcons: Record<string, string> = {
  'General Knowledge': '📋',
  'Air Brakes': '💨',
  'Combination Vehicles': '🚛',
  'Hazmat': '☢️',
  'Tanker': '🛢️',
  'Doubles/Triples': '🔗',
  'Pre-Trip Inspection': '🔍',
  'Basic Controls': '🎮',
};

export default function CategorySelectScreen({ navigation }: Props) {
  const handleSelect = (category: QuizCategory) => {
    navigation.navigate('QuizSession', { mode: 'category', category });
  };

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: 16 }}>
        <Text style={{ color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 8 }}>
          Category Drill
        </Text>
        <Text style={{ color: COLORS.gray[400], fontSize: 14, marginBottom: 24 }}>
          Select a CDL test section to practice
        </Text>

        <View style={{ gap: 10 }}>
          {QUIZ_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category}
              onPress={() => handleSelect(category)}
              activeOpacity={0.7}
              style={{
                backgroundColor: COLORS.navyLight,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: 14,
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 22, marginRight: 14 }}>
                {categoryIcons[category] || '📝'}
              </Text>
              <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '600', flex: 1 }}>
                {category}
              </Text>
              <Text style={{ color: COLORS.gray[500], fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}
