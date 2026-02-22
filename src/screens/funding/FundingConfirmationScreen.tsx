import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants';

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
            marginBottom: 24,
          }}
        >
          <Text style={{ fontSize: 48 }}>✓</Text>
        </View>

        <Text
          style={{
            color: COLORS.white,
            fontSize: 24,
            fontWeight: '800',
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Application Submitted!
        </Text>

        <Text
          style={{
            color: COLORS.gray[300],
            fontSize: 15,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 32,
            paddingHorizontal: 20,
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
