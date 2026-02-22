import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BookOpen, Wind, Truck, AlertTriangle, Droplet, Link2, Users, Bus as BusIcon, ClipboardCheck, SlidersHorizontal, ChevronRight } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { COLORS, FONTS, SPACING, QUIZ_CATEGORIES } from '../../constants';
import { QuizCategory } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const categoryIcons: Record<string, any> = {
  'General Knowledge': BookOpen,
  'Air Brakes': Wind,
  'Combination Vehicles': Truck,
  'Hazmat': AlertTriangle,
  'Tanker': Droplet,
  'Doubles/Triples': Link2,
  'Passenger': Users,
  'Bus': BusIcon,
  'Pre-Trip Inspection': ClipboardCheck,
  'Basic Controls': SlidersHorizontal,
};

export default function CategorySelectScreen({ navigation }: Props) {
  const handleSelect = (category: QuizCategory) => {
    navigation.navigate('QuizSession', { mode: 'category', category });
  };

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: SPACING.md }}>
        <Text style={{ color: COLORS.white, fontSize: 24, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 24, marginBottom: SPACING.xs }}>
          Category Drill
        </Text>
        <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.regular, marginBottom: SPACING.lg }}>
          Select a CDL test section to practice
        </Text>

        <View style={{ gap: 10 }}>
          {QUIZ_CATEGORIES.map((category) => {
            const IconComponent = categoryIcons[category] || BookOpen;
            return (
              <TouchableOpacity
                key={category}
                onPress={() => handleSelect(category)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: COLORS.navyLight,
                  borderWidth: 1,
                  borderColor: COLORS.navyMid,
                  borderRadius: 14,
                  padding: 18,
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
              >
                <View style={{ marginRight: 14 }}>
                  <IconComponent size={22} color={COLORS.amber} />
                </View>
                <Text style={{ color: COLORS.white, fontSize: 16, fontFamily: FONTS.medium, flex: 1 }}>
                  {category}
                </Text>
                <ChevronRight size={18} color={COLORS.slate} />
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </ScreenWrapper>
  );
}
