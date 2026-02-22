import React from 'react';
import { View, Text } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function FundingHomeScreen({ navigation }: Props) {
  return (
    <ScreenWrapper>
      <View style={{ paddingTop: 16 }}>
        {/* Header */}
        <Text style={{ color: COLORS.white, fontSize: 28, fontWeight: '800', marginBottom: 4 }}>
          Funding
        </Text>
        <Text style={{ color: COLORS.gray[400], fontSize: 14, marginBottom: 24 }}>
          CDL School Financing
        </Text>

        {/* Hero Card */}
        <Card style={{ marginBottom: 24, padding: 24 }}>
          <Text style={{ fontSize: 36, textAlign: 'center', marginBottom: 16 }}>💰</Text>
          <Text
            style={{
              color: COLORS.white,
              fontSize: 22,
              fontWeight: '800',
              textAlign: 'center',
              marginBottom: 12,
            }}
          >
            Want help funding CDL school?
          </Text>
          <Text
            style={{
              color: COLORS.gray[300],
              fontSize: 15,
              textAlign: 'center',
              lineHeight: 22,
              marginBottom: 24,
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
        <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '700', marginBottom: 12 }}>
          How it works
        </Text>

        <View style={{ gap: 12 }}>
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
            <Card key={item.step} padding={16}>
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
                  <Text style={{ color: COLORS.navy, fontSize: 16, fontWeight: '800' }}>
                    {item.step}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '700' }}>
                    {item.title}
                  </Text>
                  <Text style={{ color: COLORS.gray[400], fontSize: 13, marginTop: 2, lineHeight: 18 }}>
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
