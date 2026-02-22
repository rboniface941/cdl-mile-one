import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { CheckCircle } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import { COLORS, FONTS, SPACING } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function ApplySuccessScreen({ navigation, route }: Props) {
  const count = route.params?.count || 0;

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
        {/* Success checkmark circle */}
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
          <CheckCircle size={48} color={COLORS.success} />
        </View>

        <Text
          style={{
            color: COLORS.white,
            fontSize: 24,
            fontFamily: FONTS.semibold,
            letterSpacing: -0.02 * 24,
            textAlign: 'center',
            marginBottom: 12,
          }}
        >
          Applications sent to {count} carriers.
        </Text>

        <Text
          style={{
            color: COLORS.slate,
            fontSize: 15,
            fontFamily: FONTS.regular,
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 8,
            paddingHorizontal: 20,
          }}
        >
          They typically respond within 2-5 business days.
        </Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('Main', { screen: 'StudyTab' })}
          activeOpacity={0.7}
        >
          <Text
            style={{
              color: COLORS.amber,
              fontSize: 15,
              fontFamily: FONTS.medium,
              textAlign: 'center',
              textDecorationLine: 'underline',
              lineHeight: 22,
              marginBottom: 32,
              paddingHorizontal: 20,
            }}
          >
            Keep your scores up — certified drivers get more callbacks.
          </Text>
        </TouchableOpacity>

        <View style={{ width: '100%', gap: 10 }}>
          <Button
            title="Back to Study"
            onPress={() => navigation.navigate('Main', { screen: 'StudyTab' })}
          />
          <Button
            title="View Jobs"
            variant="secondary"
            onPress={() => navigation.navigate('JobsHome')}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
