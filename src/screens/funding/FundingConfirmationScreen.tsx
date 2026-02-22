import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CheckCircle } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import { COLORS, FONTS, SPACING } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function FundingConfirmationScreen({ navigation }: Props) {
  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        <View
          style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: SPACING.lg,
          }}
        >
          <CheckCircle size={48} color={COLORS.success} />
        </View>

        <Text
          style={{
            color: COLORS.white,
            fontSize: 24,
            fontFamily: FONTS.semibold,
            letterSpacing: -0.02 * 24,
            textAlign: 'center',
            marginBottom: SPACING.sm,
          }}
        >
          Application Submitted!
        </Text>

        <Text
          style={{
            color: COLORS.slate,
            fontSize: 15,
            fontFamily: FONTS.regular,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: SPACING.xl,
            paddingHorizontal: SPACING.cardPadding,
          }}
        >
          A funding specialist will contact you within 1 business day to discuss your options.
        </Text>

        <Button
          title="Back to Home"
          onPress={() => navigation.navigate('FundingHome')}
          style={{ width: '100%' }}
        />
      </View>
    </ScreenWrapper>
  );
}
