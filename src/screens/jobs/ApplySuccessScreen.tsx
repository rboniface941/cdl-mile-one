import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function ApplySuccessScreen({ navigation, route }: Props) {
  const count = route.params?.count || 0;

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
          <Text style={{ fontSize: 48 }}>🎉</Text>
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
          You've applied to {count} carriers!
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
          They'll review your profile and be in touch soon. Keep your profile updated for the best results.
        </Text>

        <Button
          title="Back to Jobs"
          onPress={() => navigation.navigate('JobsHome')}
          style={{ width: '100%' }}
        />
      </View>
    </ScreenWrapper>
  );
}
