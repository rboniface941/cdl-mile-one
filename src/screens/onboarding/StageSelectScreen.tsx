import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Search, FileText, BookOpen, Award, ChevronRight } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import { COLORS, FONTS, SPACING, CDL_STAGES } from '../../constants';
import { useOnboarding } from '../../lib/OnboardingContext';
import { supabase } from '../../lib/supabase';
import { CDLStage } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const STAGE_ICONS: Record<string, React.ReactNode> = {
  researching: <Search size={24} color={COLORS.amber} />,
  ready_to_enroll: <FileText size={24} color={COLORS.amber} />,
  in_school: <BookOpen size={24} color={COLORS.amber} />,
  graduated: <Award size={24} color={COLORS.amber} />,
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
              fontFamily: FONTS.semibold,
              color: COLORS.white,
              letterSpacing: -0.02 * 40,
            }}
          >
            Mile One
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: COLORS.amber,
              marginTop: SPACING.xs,
              fontFamily: FONTS.medium,
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
            fontFamily: FONTS.semibold,
            color: COLORS.white,
            textAlign: 'center',
            marginBottom: SPACING.lg,
            letterSpacing: -0.02 * 22,
          }}
        >
          Where are you in your CDL journey?
        </Text>

        {/* Options */}
        <View style={{ gap: SPACING.sm }}>
          {CDL_STAGES.map((option) => (
            <TouchableOpacity
              key={option.value}
              onPress={() => handleSelect(option.value as CDLStage)}
              activeOpacity={0.7}
              style={{
                backgroundColor: COLORS.navyLight,
                borderWidth: 1,
                borderColor: COLORS.navyMid,
                borderRadius: 16,
                padding: SPACING.cardPadding,
                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              <View style={{ marginRight: 14 }}>
                {STAGE_ICONS[option.value]}
              </View>
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: 16,
                  fontFamily: FONTS.semibold,
                  flex: 1,
                }}
              >
                {option.label}
              </Text>
              <ChevronRight size={20} color={COLORS.slate} />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Powered by Transtech */}
      <View style={{ alignItems: 'center', paddingBottom: 24 }}>
        <Text
          style={{
            fontSize: 12,
            color: COLORS.slate,
            fontFamily: FONTS.regular,
            marginBottom: 6,
          }}
        >
          Powered by
        </Text>
        <Image
          source={{
            uri: supabase.storage
              .from('assets')
              .getPublicUrl('transtech-logo.png').data.publicUrl,
          }}
          style={{ width: 120, height: 40 }}
          resizeMode="contain"
        />
      </View>
    </ScreenWrapper>
  );
}
