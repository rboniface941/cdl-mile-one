import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CreditCard } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS, FONTS, SPACING } from '../../constants';
import { useAuthContext } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const EMPLOYMENT_OPTIONS = ['Employed', 'Self-Employed', 'Unemployed'];

export default function FundingHomeScreen({ navigation }: Props) {
  const { profile } = useAuthContext();
  const [loanAmount, setLoanAmount] = useState(5000);
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (!employmentStatus || !monthlyIncome) {
      Alert.alert('Missing Info', 'Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.from('loan_applications').insert({
        user_id: profile?.id,
        full_name: profile?.full_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        loan_amount: loanAmount,
        employment_status: employmentStatus,
        monthly_income: parseInt(monthlyIncome),
        zip_code: '',
      });

      if (error) throw error;

      try {
        await supabase.functions.invoke('notify-loan-application', {
          body: {
            full_name: profile?.full_name,
            email: profile?.email,
            loan_amount: loanAmount,
          },
        });
      } catch (_) {}

      setSubmitted(true);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 40 }}>
          <View
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(34,197,94,0.15)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: SPACING.lg,
            }}
          >
            <CreditCard size={36} color={COLORS.success} />
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
            Application Submitted
          </Text>
          <Text
            style={{
              color: COLORS.slate,
              fontSize: 15,
              fontFamily: FONTS.regular,
              textAlign: 'center',
              lineHeight: 22,
              paddingHorizontal: SPACING.lg,
            }}
          >
            A funding specialist will contact you within 1 business day to discuss your options.
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: SPACING.md }}>
        <Text
          style={{
            color: COLORS.white,
            fontSize: 28,
            fontFamily: FONTS.semibold,
            letterSpacing: -0.02 * 28,
            marginBottom: SPACING.xs,
          }}
        >
          Fund Your CDL School
        </Text>
        <Text
          style={{
            color: COLORS.slate,
            fontSize: 15,
            fontFamily: FONTS.regular,
            lineHeight: 22,
            marginBottom: SPACING.lg,
          }}
        >
          CDL school costs $3,000–$7,000. See what you qualify for in 60 seconds.
        </Text>

        {/* Pre-filled info */}
        <Card style={{ marginBottom: SPACING.md }}>
          <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.medium, marginBottom: 6 }}>
            YOUR INFO
          </Text>
          <Text style={{ color: COLORS.white, fontSize: 15, fontFamily: FONTS.semibold }}>
            {profile?.full_name || 'N/A'}
          </Text>
          <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular, marginTop: 2 }}>
            {profile?.email} · {profile?.phone}
          </Text>
        </Card>

        {/* Loan Amount */}
        <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.medium, marginBottom: 10 }}>
          Desired Loan Amount
        </Text>
        <Text
          style={{
            color: COLORS.amber,
            fontSize: 36,
            fontFamily: FONTS.semibold,
            letterSpacing: -0.02 * 36,
            textAlign: 'center',
            marginBottom: SPACING.sm,
          }}
        >
          ${loanAmount.toLocaleString()}
        </Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.lg }}>
          {[1000, 3000, 5000, 7000, 10000].map((amount) => (
            <Button
              key={amount}
              title={`$${amount >= 1000 ? `${(amount / 1000).toFixed(0)}K` : amount}`}
              variant={loanAmount === amount ? 'primary' : 'outline'}
              size="sm"
              fullWidth={false}
              onPress={() => setLoanAmount(amount)}
              style={{ paddingHorizontal: 14 }}
            />
          ))}
        </View>

        {/* Monthly Income */}
        <Input
          label="Monthly Income"
          placeholder="$3,000"
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
          keyboardType="numeric"
        />

        {/* Employment Status */}
        <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.medium, marginBottom: 10 }}>
          Employment Status
        </Text>
        <View style={{ flexDirection: 'row', gap: SPACING.xs, marginBottom: SPACING.lg }}>
          {EMPLOYMENT_OPTIONS.map((option) => (
            <Button
              key={option}
              title={option}
              variant={employmentStatus === option ? 'primary' : 'outline'}
              size="sm"
              fullWidth={false}
              onPress={() => setEmploymentStatus(option)}
              style={{ paddingHorizontal: 14, flex: 1 }}
            />
          ))}
        </View>

        <Button
          title="Submit Application"
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </ScreenWrapper>
  );
}
