import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import { COLORS, EQUIPMENT_TYPES } from '../../constants';
import { useAuthContext } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { Carrier, DriverProfile } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function JobsHomeScreen({ navigation }: Props) {
  const { profile } = useAuthContext();
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [appliedCarriers, setAppliedCarriers] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [carriersRes, driverRes, appsRes] = await Promise.all([
        supabase.from('carriers').select('*').eq('is_active', true),
        profile?.id
          ? supabase.from('driver_profiles').select('*').eq('id', profile.id).single()
          : Promise.resolve({ data: null, error: null }),
        profile?.id
          ? supabase.from('applications').select('carrier_id').eq('user_id', profile.id)
          : Promise.resolve({ data: null, error: null }),
      ]);

      if (carriersRes.data) setCarriers(carriersRes.data);
      if (driverRes.data) setDriverProfile(driverRes.data);
      if (appsRes.data) {
        setAppliedCarriers(new Set(appsRes.data.map((a: any) => a.carrier_id)));
      }
    } catch (err) {
      console.error('Error fetching jobs data:', err);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchData);
    return unsubscribe;
  }, [navigation, fetchData]);

  const completeness = profile?.profile_completeness || 0;
  const visibleCarriers = Math.max(1, Math.round((completeness / 100) * 45));

  const filteredCarriers = selectedFilter === 'All'
    ? carriers
    : carriers.filter(c => c.equipment_type === selectedFilter);

  const getMatchScore = (carrier: Carrier): number => {
    if (!driverProfile) return 0;
    let score = 0;
    if (driverProfile.equipment_preference?.includes(carrier.equipment_type)) score += 40;
    if (driverProfile.job_type && carrier.job_title.toLowerCase().includes(driverProfile.job_type.toLowerCase())) score += 30;
    if (completeness >= 80) score += 20;
    if (completeness >= 50) score += 10;
    return Math.min(score, 100);
  };

  const handleApply = async (carrierId: number) => {
    if (!profile?.id) return;
    try {
      const { error } = await supabase.from('applications').insert({
        user_id: profile.id,
        carrier_id: carrierId,
      });
      if (error && error.code !== '23505') throw error; // Ignore duplicate
      setAppliedCarriers(prev => new Set([...prev, carrierId]));

      // Notify admin
      try {
        await supabase.functions.invoke('notify-application', {
          body: { user_id: profile.id, carrier_id: carrierId },
        });
      } catch (_) {}
    } catch (err: any) {
      console.error('Apply error:', err);
    }
  };

  const handleApplyAll = () => {
    navigation.navigate('ApplyAll', {
      carriers: filteredCarriers.filter(c => !appliedCarriers.has(c.id)),
      completeness,
    });
  };

  const renderCarrier = ({ item }: { item: Carrier }) => {
    const matchScore = getMatchScore(item);
    const hasApplied = appliedCarriers.has(item.id);

    return (
      <Card style={{ marginBottom: 12 }} padding={18}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View style={{ flex: 1 }}>
            {/* Company Logo Placeholder */}
            <View
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                backgroundColor: 'rgba(245,158,11,0.12)',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text style={{ fontSize: 20 }}>🚛</Text>
            </View>

            <Text style={{ color: COLORS.white, fontSize: 17, fontWeight: '700', marginBottom: 4 }}>
              {item.company_name}
            </Text>
            <Text style={{ color: COLORS.gray[400], fontSize: 13, marginBottom: 10 }}>
              {item.job_title}
            </Text>
          </View>

          {matchScore > 0 && (
            <View
              style={{
                backgroundColor: matchScore >= 70 ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.12)',
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 5,
              }}
            >
              <Text
                style={{
                  color: matchScore >= 70 ? COLORS.success : COLORS.amber,
                  fontSize: 12,
                  fontWeight: '700',
                }}
              >
                {matchScore}% match
              </Text>
            </View>
          )}
        </View>

        {/* Details */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <View>
            <Text style={{ color: COLORS.gray[500], fontSize: 11, fontWeight: '600' }}>PAY</Text>
            <Text style={{ color: COLORS.amber, fontSize: 14, fontWeight: '700' }}>{item.pay_range}</Text>
          </View>
          <View>
            <Text style={{ color: COLORS.gray[500], fontSize: 11, fontWeight: '600' }}>HOME TIME</Text>
            <Text style={{ color: COLORS.white, fontSize: 14 }}>{item.home_time}</Text>
          </View>
          <View>
            <Text style={{ color: COLORS.gray[500], fontSize: 11, fontWeight: '600' }}>EQUIPMENT</Text>
            <Text style={{ color: COLORS.white, fontSize: 14 }}>{item.equipment_type}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: COLORS.gray[500], fontSize: 12 }}>📍 {item.location}</Text>
          {item.requirements && (
            <Text style={{ color: COLORS.gray[500], fontSize: 12 }}>· {item.requirements}</Text>
          )}
        </View>

        <Button
          title={hasApplied ? 'Applied' : 'Apply Now'}
          variant={hasApplied ? 'secondary' : 'primary'}
          size="sm"
          onPress={() => !hasApplied && handleApply(item.id)}
          disabled={hasApplied}
          style={{ marginTop: 14 }}
        />
      </Card>
    );
  };

  return (
    <ScreenWrapper scrollable={false} padding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        {/* Header */}
        <Text style={{ color: COLORS.white, fontSize: 28, fontWeight: '800', marginBottom: 4 }}>
          Jobs
        </Text>
        <Text style={{ color: COLORS.gray[400], fontSize: 14, marginBottom: 16 }}>
          CDL Job Board
        </Text>

        {/* Profile Completeness Banner */}
        {completeness < 100 && (
          <Card style={{ marginBottom: 16 }} padding={14}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ color: COLORS.white, fontSize: 14, fontWeight: '600' }}>
                Complete your profile
              </Text>
              <Text style={{ color: COLORS.amber, fontSize: 13, fontWeight: '700' }}>
                Visible to {visibleCarriers} carriers
              </Text>
            </View>
            <ProgressBar progress={completeness / 100} height={5} />
            <TouchableOpacity onPress={() => navigation.navigate('ProfileBuilder')}>
              <Text style={{ color: COLORS.amber, fontSize: 13, fontWeight: '600', marginTop: 8 }}>
                Build Profile →
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        {/* Apply to All CTA */}
        {filteredCarriers.filter(c => !appliedCarriers.has(c.id)).length > 0 && (
          <Button
            title={`Apply to All ${filteredCarriers.filter(c => !appliedCarriers.has(c.id)).length} Carriers`}
            onPress={handleApplyAll}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Filter Bar */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', ...EQUIPMENT_TYPES]}
          keyExtractor={(item) => item}
          style={{ marginBottom: 16, maxHeight: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setSelectedFilter(item)}
              style={{
                backgroundColor: selectedFilter === item ? COLORS.amber : COLORS.navyLight,
                borderRadius: 20,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: selectedFilter === item ? COLORS.navy : COLORS.gray[400],
                  fontSize: 13,
                  fontWeight: '600',
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Carrier List */}
      <FlatList
        data={filteredCarriers}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderCarrier}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ color: COLORS.gray[500], fontSize: 15 }}>
              No carriers match this filter
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
