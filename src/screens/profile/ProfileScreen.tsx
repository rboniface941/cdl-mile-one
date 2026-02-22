import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Flame } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ProgressBar from '../../components/common/ProgressBar';
import { COLORS, FONTS, CDL_STAGES } from '../../constants';
import { useAuthContext } from '../../lib/AuthContext';
import { useQuizStats } from '../../hooks/useQuiz';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { profile, signOut } = useAuthContext();
  const { stats, fetchStats } = useQuizStats(profile?.id);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stageLabel = CDL_STAGES.find(s => s.value === profile?.stage)?.label || 'Unknown';

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut();
          } catch (err) {
            console.error('Sign out error:', err);
          }
        },
      },
    ]);
  };

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: 24 }}>
        {/* Avatar & Name */}
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: COLORS.amber,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 32, color: COLORS.navy, fontFamily: FONTS.semibold }}>
              {(profile?.full_name || '?')[0].toUpperCase()}
            </Text>
          </View>
          <Text style={{ color: COLORS.white, fontSize: 22, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 22 }}>
            {profile?.full_name || 'User'}
          </Text>
          <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.regular, marginTop: 4 }}>
            {profile?.email}
          </Text>
        </View>

        {/* Profile Completeness */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.medium, marginBottom: 8 }}>
            PROFILE COMPLETENESS
          </Text>
          <ProgressBar
            progress={(profile?.profile_completeness || 0) / 100}
            showLabel
            height={8}
          />
        </Card>

        {/* CDL Stage */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View>
              <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.medium, marginBottom: 4 }}>
                CDL STAGE
              </Text>
              <Text style={{ color: COLORS.white, fontSize: 16, fontFamily: FONTS.semibold }}>
                {stageLabel}
              </Text>
            </View>
          </View>
        </Card>

        {/* Streak */}
        <Card style={{ marginBottom: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={{ marginRight: 12 }}>
              <Flame size={28} color={COLORS.amber} />
            </View>
            <View>
              <Text style={{ color: COLORS.white, fontSize: 20, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 20 }}>
                {stats.streakCount} day streak
              </Text>
              <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular }}>
                Keep practicing daily!
              </Text>
            </View>
          </View>
        </Card>

        {/* Quiz Stats */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.medium, marginBottom: 12 }}>
            QUIZ STATS
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.amber, fontSize: 24, fontFamily: FONTS.semibold }}>
                {stats.overallPercentage}%
              </Text>
              <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, marginTop: 2 }}>Score</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.white, fontSize: 24, fontFamily: FONTS.semibold }}>
                {stats.totalAnswered}
              </Text>
              <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, marginTop: 2 }}>Questions</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: COLORS.success, fontSize: 24, fontFamily: FONTS.semibold }}>
                {stats.totalCorrect}
              </Text>
              <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, marginTop: 2 }}>Correct</Text>
            </View>
          </View>
        </Card>

        {/* Actions */}
        <View style={{ gap: 10, marginTop: 8 }}>
          <Button
            title="Edit Driver Profile"
            variant="secondary"
            onPress={() => navigation.navigate('ProfileBuilder')}
          />
          <Button
            title="Sign Out"
            variant="ghost"
            onPress={handleSignOut}
            textStyle={{ color: COLORS.error }}
          />
        </View>
      </View>
    </ScreenWrapper>
  );
}
