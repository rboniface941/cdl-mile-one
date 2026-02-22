import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS, FONTS, SPACING } from '../../constants';
import { useOnboarding } from '../../lib/OnboardingContext';
import { useAuthContext } from '../../lib/AuthContext';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function OnboardingResultsScreen({ navigation }: Props) {
  const { state, completeOnboarding } = useOnboarding();
  const { signUp } = useAuthContext();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const percentage = state.quizTotal > 0
    ? Math.round((state.quizScore / state.quizTotal) * 100)
    : 0;

  const getMessage = () => {
    if (percentage >= 80) return "Great job! You're well on your way.";
    if (percentage >= 60) return 'Good start! Regular practice will get you there.';
    return "No worries — that's what practice is for!";
  };

  const handleSignUp = async () => {
    if (!fullName.trim() || !email.trim() || !phone.trim() || !password.trim()) {
      Alert.alert('Missing Info', 'Please fill in all fields to save your progress.');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Password Too Short', 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email.trim(), password, fullName.trim(), phone.trim(), state.stage!);
      completeOnboarding();
    } catch (err: any) {
      Alert.alert('Sign Up Error', err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={{ flex: 1, paddingTop: SPACING.xl }}>
        {/* Score Display */}
        <View style={{ alignItems: 'center', marginBottom: SPACING.xl }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 3,
              borderColor: percentage >= 70 ? COLORS.success : COLORS.amber,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING.md,
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontSize: 36,
                fontFamily: FONTS.semibold,
                letterSpacing: -0.02 * 36,
              }}
            >
              {percentage}%
            </Text>
          </View>
          <Text
            style={{
              color: COLORS.white,
              fontSize: 18,
              fontFamily: FONTS.semibold,
              textAlign: 'center',
              letterSpacing: -0.02 * 18,
            }}
          >
            {state.quizScore} out of {state.quizTotal} correct
          </Text>
          <Text
            style={{
              color: COLORS.slate,
              fontSize: 15,
              fontFamily: FONTS.regular,
              marginTop: SPACING.xs,
              textAlign: 'center',
            }}
          >
            {getMessage()}
          </Text>
        </View>

        {/* Sign Up Form */}
        <Card style={{ marginBottom: SPACING.cardPadding }}>
          <Text
            style={{
              color: COLORS.white,
              fontSize: 18,
              fontFamily: FONTS.semibold,
              marginBottom: 4,
              letterSpacing: -0.02 * 18,
            }}
          >
            Save your progress
          </Text>
          <Text
            style={{
              color: COLORS.slate,
              fontSize: 14,
              fontFamily: FONTS.regular,
              marginBottom: SPACING.cardPadding,
            }}
          >
            Create a free account to track your study progress and access all features.
          </Text>

          <Input
            label="Full Name"
            placeholder="John Smith"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />
          <Input
            label="Email"
            placeholder="john@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            label="Phone"
            placeholder="(555) 123-4567"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />
          <Input
            label="Password"
            placeholder="Min. 6 characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title="Create Account & Continue"
            onPress={handleSignUp}
            loading={loading}
            style={{ marginTop: SPACING.xs }}
          />
        </Card>
      </View>
    </ScreenWrapper>
  );
}
