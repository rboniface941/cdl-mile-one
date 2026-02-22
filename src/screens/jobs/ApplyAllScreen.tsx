import React, { useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import { COLORS } from '../../constants';
import { useAuthContext } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { Carrier } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function ApplyAllScreen({ navigation, route }: Props) {
  const { profile } = useAuthContext();
  const carriers: Carrier[] = route.params?.carriers || [];
  const completeness: number = route.params?.completeness || 0;
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const applications = carriers.map(carrier => ({
        user_id: profile.id,
        carrier_id: carrier.id,
      }));

      const { error } = await supabase.from('applications').upsert(applications, {
        onConflict: 'user_id,carrier_id',
      });

      if (error) throw error;

      // Notify admin
      try {
        await supabase.functions.invoke('notify-bulk-application', {
          body: {
            user_id: profile.id,
            carrier_count: carriers.length,
          },
        });
      } catch (_) {}

      navigation.replace('ApplySuccess', { count: carriers.length });
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit applications.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: 16 }}>
        <Text style={{ color: COLORS.white, fontSize: 24, fontWeight: '800', marginBottom: 4 }}>
          Apply to All Carriers
        </Text>
        <Text style={{ color: COLORS.gray[400], fontSize: 14, marginBottom: 20 }}>
          Review your application before confirming
        </Text>

        {/* Profile Completeness */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ color: COLORS.gray[400], fontSize: 12, fontWeight: '600', marginBottom: 8 }}>
            PROFILE COMPLETENESS
          </Text>
          <ProgressBar progress={completeness / 100} showLabel height={8} />
          {completeness < 80 && (
            <Text style={{ color: COLORS.amber, fontSize: 12, marginTop: 8 }}>
              Tip: Complete your profile to increase your chances of getting hired.
            </Text>
          )}
        </Card>

        {/* Carrier List */}
        <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>
          Applying to {carriers.length} carriers:
        </Text>

        <View style={{ gap: 8, marginBottom: 24 }}>
          {carriers.map((carrier) => (
            <Card key={carrier.id} padding={14}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: 'rgba(245,158,11,0.12)',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontSize: 16 }}>🚛</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}>
                    {carrier.company_name}
                  </Text>
                  <Text style={{ color: COLORS.gray[400], fontSize: 12 }}>
                    {carrier.pay_range} · {carrier.home_time}
                  </Text>
                </View>
              </View>
            </Card>
          ))}
        </View>

        <Button title="Confirm & Apply" onPress={handleConfirm} loading={loading} />
        <Button
          title="Cancel"
          variant="ghost"
          onPress={() => navigation.goBack()}
          style={{ marginTop: 8 }}
        />
      </View>
    </ScreenWrapper>
  );
}
