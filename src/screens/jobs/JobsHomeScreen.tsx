import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Truck, MapPin } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import { COLORS, FONTS, SPACING, EQUIPMENT_TYPES } from '../../constants';
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
  const stage = profile?.stage;

  const filteredCarriers = selectedFilter === 'All'
    ? carriers
    : carriers.filter(c => c.equipment_type === selectedFilter);

  const unappliedCarriers = filteredCarriers.filter(c => !appliedCarriers.has(c.id));

  const getMatchScore = (carrier: Carrier): number => {
    if (!driverProfile) return 0;
    let score = 0;
    if (driverProfile.equipment_preference?.includes(carrier.equipment_type)) score += 40;
    if (driverProfile.job_type && carrier.job_title.toLowerCase().includes(driverProfile.job_type.toLowerCase())) score += 30;
    if (completeness >= 80) score += 20;
    if (completeness >= 50) score += 10;
    return Math.min(score, 100);
  };

  const getProfileSubtext = (): string => {
    if (completeness <= 40) {
      return 'Complete your profile to unlock carrier matching.';
    }
    if (completeness <= 79) {
      const visibleCount = Math.round((completeness / 100) * carriers.length);
      return `You're visible to ${visibleCount} carriers \u2014 finish your profile to apply in one tap.`;
    }
    if (completeness <= 99) {
      return 'Almost there \u2014 add your employment history to unlock Apply to All.';
    }
    return '';
  };

  const handleApply = async (carrierId: number) => {
    if (!profile?.id) return;
    try {
      const { error } = await supabase.from('applications').insert({
        user_id: profile.id,
        carrier_id: carrierId,
      });
      if (error && error.code !== '23505') throw error;
      setAppliedCarriers(prev => new Set([...prev, carrierId]));

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
    if (completeness < 100) {
      // Determine missing field for messaging
      const missingFields: string[] = [];
      if (!driverProfile?.cdl_class) missingFields.push('CDL class');
      if (!driverProfile?.state_issued) missingFields.push('state');
      if (!driverProfile?.job_type) missingFields.push('job type');
      if ((driverProfile?.equipment_preference || []).length === 0) missingFields.push('equipment preferences');
      if ((driverProfile?.previous_employers || []).length === 0) missingFields.push('employment history');

      const missingField = missingFields.length > 0 ? missingFields[0] : 'remaining details';

      // Navigate to ProfileBuilder with context
      navigation.navigate('ProfileBuilder', {
        message: `Your profile is ${completeness}% complete. Add ${missingField} to apply to all carriers.`,
      });
      return;
    }

    navigation.navigate('ApplyAll', {
      carriers: unappliedCarriers,
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
                backgroundColor: COLORS.navyMid,
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Truck size={20} color={COLORS.amber} />
            </View>

            <Text style={{ color: COLORS.white, fontSize: 17, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 17, marginBottom: 4 }}>
              {item.company_name}
            </Text>
            <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular, marginBottom: 10 }}>
              {item.job_title}
            </Text>
          </View>

          {/* Match indicator badge */}
          <View
            style={{
              backgroundColor: matchScore >= 70 ? COLORS.amber : COLORS.navyMid,
              borderRadius: 8,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text
              style={{
                color: matchScore >= 70 ? COLORS.navy : COLORS.slate,
                fontSize: 12,
                fontFamily: FONTS.semibold,
              }}
            >
              {matchScore >= 70 ? 'Strong Match' : 'Partial Match'}
            </Text>
          </View>
        </View>

        {/* Details row */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 14 }}>
          <View>
            <Text style={{ color: COLORS.slate, fontSize: 11, fontFamily: FONTS.medium }}>PAY</Text>
            <Text style={{ color: COLORS.amber, fontSize: 14, fontFamily: FONTS.semibold }}>{item.pay_range}</Text>
          </View>
          <View>
            <Text style={{ color: COLORS.slate, fontSize: 11, fontFamily: FONTS.medium }}>HOME TIME</Text>
            <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.regular }}>{item.home_time}</Text>
          </View>
          <View>
            <Text style={{ color: COLORS.slate, fontSize: 11, fontFamily: FONTS.medium }}>EQUIPMENT</Text>
            <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.regular }}>{item.equipment_type}</Text>
          </View>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 14 }}>
          <MapPin size={14} color={COLORS.slate} />
          <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular }}>{item.location}</Text>
        </View>

        {/* Stage-based subtext for researching */}
        {stage === 'researching' && (
          <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, fontStyle: 'italic', marginBottom: 10 }}>
            Come back when you're closer to graduation
          </Text>
        )}

        <Button
          title={hasApplied ? 'Applied' : 'Apply'}
          variant={hasApplied ? 'secondary' : 'outline'}
          size="sm"
          onPress={() => !hasApplied && handleApply(item.id)}
          disabled={hasApplied}
        />
      </Card>
    );
  };

  return (
    <ScreenWrapper scrollable={false} padding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        {/* Profile completeness header */}
        {completeness < 100 ? (
          <View style={{ marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.medium }}>
                Driver Profile
              </Text>
              <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.medium }}>
                {completeness}%
              </Text>
            </View>
            <ProgressBar
              progress={completeness / 100}
              height={4}
              backgroundColor={COLORS.navyMid}
            />
            <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular, marginTop: 8 }}>
              {getProfileSubtext()}
            </Text>
          </View>
        ) : (
          /* 100% complete: Apply to All CTA replaces the bar */
          unappliedCarriers.length > 0 && stage === 'graduated' ? (
            <Button
              title="Apply to All \u2014 1 Tap"
              onPress={handleApplyAll}
              style={{ marginBottom: 16 }}
            />
          ) : null
        )}

        {/* Apply to All for graduated users with incomplete profile still shows if applicable */}
        {completeness < 100 && unappliedCarriers.length > 0 && stage === 'graduated' && (
          <Button
            title={`Apply to All ${unappliedCarriers.length} Carriers`}
            onPress={handleApplyAll}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Apply to All for non-graduated users at 100% */}
        {completeness >= 100 && unappliedCarriers.length > 0 && stage !== 'graduated' && (
          <Button
            title={`Apply to All ${unappliedCarriers.length} Carriers`}
            onPress={handleApplyAll}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* Filter bar */}
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
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: selectedFilter === item ? COLORS.navy : COLORS.slate,
                  fontSize: 13,
                  fontFamily: FONTS.medium,
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
            <Text style={{ color: COLORS.slate, fontSize: 15, fontFamily: FONTS.regular }}>
              No carriers match this filter
            </Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
