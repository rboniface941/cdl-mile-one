import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { COLORS, CDL_STAGES } from '../../constants';
import { useOnboarding } from '../../lib/OnboardingContext';
import { CDLStage } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function StageSelectScreen({ navigation }: Props) {
  const { setStage } = useOnboarding();

  const handleSelect = (stage: CDLStage) => {
    setStage(stage);
    navigation.navigate('OnboardingQuiz');
  };

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', paddingVertical: 40 }}>
        {/* Logo / Branding */}
        <View style={{ alignItems: 'center', marginBottom: 48 }}>
          <Text
            style={{
              fontSize: 40,
              fontWeight: '800',
              color: COLORS.white,
              letterSpacing: -1,
            }}
          >
            Mile One
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: COLORS.amber,
              marginTop: 8,
              fontWeight: '500',
              textAlign: 'center',
              lineHeight: 22,
            }}
          >
            Start your CDL career.{'\n'}Get licensed, funded & hired.
          </Text>
        </View>

        {/* Question */}
        <Text
          style={{
            fontSize: 22,
            fontWeight: '700',
            color: COLORS.white,
            textAlign: 'center',
            marginBottom: 24,
          }}
        >
          Where are you in your CDL journey?
        </Text>

        {/* Options */}
        <View style={{ gap: 12 }}>
          {CDL_STAGES.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value as CDLStage)}
              activeOpacity={0.7}
              style={{
                backgroundColor: COLORS.navyLight,
                borderWidth: 1.5,
                borderColor: 'rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: 20,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <Text style={{ fontSize: 24, marginRight: 14 }}>{option.emoji}</Text>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 16,
                  fontWeight: '600',
                  flex: 1,
                }}
              >
                {option.label}
              </Text>
              <Text style={{ color: COLORS.gray[500], fontSize: 20 }}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}
