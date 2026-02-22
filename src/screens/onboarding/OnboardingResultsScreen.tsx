import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants';
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
      <View style={{ flex: 1, paddingTop: 32 }}>
        {/* Score Display */}
        <View style={{ alignItems: 'center', marginBottom: 32 }}>
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              borderWidth: 4,
              borderColor: percentage >= 70 ? COLORS.success : COLORS.amber,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text style={{ color: COLORS.white, fontSize: 36, fontWeight: '800' }}>
              {percentage}%
            </Text>
          </View>
          <Text style={{ color: COLORS.white, fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
            {state.quizScore} out of {state.quizTotal} correct
          </Text>
          <Text style={{ color: COLORS.gray[400], fontSize: 15, marginTop: 8, textAlign: 'center' }}>
            {getMessage()}
          </Text>
        </View>

        {/* Sign Up Form */}
        <Card style={{ marginBottom: 20 }}>
          <Text
            style={{
              color: COLORS.white,
              fontSize: 18,
              fontWeight: '700',
              marginBottom: 4,
            }}
          >
            Save your progress
          </Text>
          <Text
            style={{
              color: COLORS.gray[400],
              fontSize: 14,
              marginBottom: 20,
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
            style={{ marginTop: 8 }}
          />
        </Card>
      </View>
    </ScreenWrapper>
  );
}
