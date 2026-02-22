import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import { COLORS } from '../../constants';
import { useAuthContext } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const EMPLOYMENT_OPTIONS = ['Employed Full-Time', 'Employed Part-Time', 'Self-Employed', 'Unemployed', 'Student'];

export default function FundingApplicationScreen({ navigation }: Props) {
  const { profile } = useAuthContext();
  const [loanAmount, setLoanAmount] = useState(5000);
  const [employmentStatus, setEmploymentStatus] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!employmentStatus || !monthlyIncome || !zipCode) {
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
        zip_code: zipCode,
      });

      if (error) throw error;

      // Trigger edge function for email notification (fire and forget)
      try {
        await supabase.functions.invoke('notify-loan-application', {
          body: {
            full_name: profile?.full_name,
            email: profile?.email,
            loan_amount: loanAmount,
          },
        });
      } catch (_) {
        // Edge function may not be deployed yet
      }

      navigation.replace('FundingConfirmation');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: 16 }}>
        <Text style={{ color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 4 }}>
          Funding Application
        </Text>
        <Text style={{ color: COLORS.gray[400], fontSize: 14, marginBottom: 24 }}>
          Tell us about your situation
        </Text>

        {/* Pre-filled info */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ color: COLORS.gray[400], fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            YOUR INFO
          </Text>
          <Text style={{ color: COLORS.white, fontSize: 15, fontWeight: '600' }}>
            {profile?.full_name || 'N/A'}
          </Text>
          <Text style={{ color: COLORS.gray[400], fontSize: 13, marginTop: 2 }}>
            {profile?.email} · {profile?.phone}
          </Text>
        </Card>

        {/* Loan Amount Slider */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ color: COLORS.gray[400], fontSize: 12, fontWeight: '600', marginBottom: 12 }}>
            DESIRED LOAN AMOUNT
          </Text>
          <Text style={{ color: COLORS.amber, fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 12 }}>
            ${loanAmount.toLocaleString()}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ color: COLORS.gray[500], fontSize: 12 }}>$1,000</Text>
            <Text style={{ color: COLORS.gray[500], fontSize: 12 }}>$10,000</Text>
          </View>
          {/* Slider buttons since RN Slider needs extra package */}
          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 8 }}>
            {[3000, 5000, 7000, 10000].map((amount) => (
              <Button
                key={amount}
                title={`$${(amount / 1000).toFixed(0)}K`}
                variant={loanAmount === amount ? 'primary' : 'outline'}
                size="sm"
                fullWidth={false}
                onPress={() => setLoanAmount(amount)}
                style={{ paddingHorizontal: 16 }}
              />
            ))}
          </View>
        </Card>

        {/* Employment Status */}
        <Text style={{ color: COLORS.gray[300], fontSize: 14, fontWeight: '500', marginBottom: 10 }}>
          Employment Status
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
          {EMPLOYMENT_OPTIONS.map((option) => (
            <Button
              key={option}
              title={option}
              variant={employmentStatus === option ? 'primary' : 'secondary'}
              size="sm"
              fullWidth={false}
              onPress={() => setEmploymentStatus(option)}
              style={{ paddingHorizontal: 14 }}
            />
          ))}
        </View>

        <Input
          label="Monthly Income"
          placeholder="$3,000"
          value={monthlyIncome}
          onChangeText={setMonthlyIncome}
          keyboardType="numeric"
        />

        <Input
          label="Zip Code"
          placeholder="12345"
          value={zipCode}
          onChangeText={setZipCode}
          keyboardType="numeric"
          maxLength={5}
        />

        <Button
          title="Submit Application"
          onPress={handleSubmit}
          loading={loading}
          style={{ marginTop: 8 }}
        />
      </View>
    </ScreenWrapper>
  );
}
