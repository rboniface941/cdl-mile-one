import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Banknote } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { COLORS, FONTS, SPACING } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function FundingHomeScreen({ navigation }: Props) {
  return (
    <ScreenWrapper>
      <View style={{ paddingTop: SPACING.md }}>
        {/* Header */}
        <Text
          style={{
            color: COLORS.white,
            fontSize: 28,
            fontFamily: FONTS.semibold,
            letterSpacing: -0.02 * 28,
            marginBottom: 4,
          }}
        >
          Funding
        </Text>
        <Text
          style={{
            color: COLORS.slate,
            fontSize: 14,
            fontFamily: FONTS.regular,
            marginBottom: SPACING.lg,
          }}
        >
          CDL School Financing
        </Text>

        {/* Hero Card */}
        <Card style={{ marginBottom: SPACING.lg, padding: SPACING.lg }}>
          <View style={{ alignItems: 'center', marginBottom: SPACING.md }}>
            <Banknote size={32} color={COLORS.amber} />
          </View>
          <Text
            style={{
              color: COLORS.white,
              fontSize: 22,
              fontFamily: FONTS.semibold,
              letterSpacing: -0.02 * 22,
              textAlign: 'center',
              marginBottom: SPACING.sm,
            }}
          >
            Want help funding CDL school?
          </Text>
          <Text
            style={{
              color: COLORS.slate,
              fontSize: 15,
              fontFamily: FONTS.regular,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: SPACING.lg,
            }}
          >
            CDL school costs $3,000–$7,000. See what you qualify for in 60 seconds.
          </Text>
          <Button
            title="Check My Options"
            onPress={() => navigation.navigate('FundingApplication')}
          />
        </Card>

        {/* Info Cards */}
        <Text
          style={{
            color: COLORS.white,
            fontSize: 18,
            fontFamily: FONTS.semibold,
            letterSpacing: -0.02 * 18,
            marginBottom: SPACING.sm,
          }}
        >
          How it works
        </Text>

        <View style={{ gap: SPACING.sm }}>
          {[
            {
              step: '1',
              title: 'Quick Application',
              desc: 'Answer a few questions about your situation — takes under 60 seconds.',
            },
            {
              step: '2',
              title: 'Expert Review',
              desc: 'A funding specialist reviews your application within 1 business day.',
            },
            {
              step: '3',
              title: 'Get Funded',
              desc: "We'll match you with the best funding options for your situation.",
            },
          ].map((item) => (
            <Card key={item.step} padding={SPACING.md}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: COLORS.amber,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 14,
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.navy,
                      fontSize: 16,
                      fontFamily: FONTS.semibold,
                    }}
                  >
                    {item.step}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: COLORS.white,
                      fontSize: 15,
                      fontFamily: FONTS.semibold,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={{
                      color: COLORS.slate,
                      fontSize: 13,
                      fontFamily: FONTS.regular,
                      marginTop: 2,
                      lineHeight: 18,
                    }}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>
      </View>
    </ScreenWrapper>
  );
}
