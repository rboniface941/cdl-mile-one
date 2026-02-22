import React, { useState, useRef, useCallback } from 'react';
import { View, Text, FlatList, Alert, Animated } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Truck, Check } from 'lucide-react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import { COLORS, FONTS, SPACING } from '../../constants';
import { useAuthContext } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { Carrier, DriverProfile } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function ApplyAllScreen({ navigation, route }: Props) {
  const { profile } = useAuthContext();
  const carriers: Carrier[] = route.params?.carriers || [];
  const completeness: number = route.params?.completeness || 0;
  const [loading, setLoading] = useState(false);
  const [driverProfile, setDriverProfile] = useState<DriverProfile | null>(null);
  const [appliedIndices, setAppliedIndices] = useState<Set<number>>(new Set());
  const checkAnimations = useRef<Animated.Value[]>(
    carriers.map(() => new Animated.Value(0))
  ).current;

  // Fetch driver profile for summary
  React.useEffect(() => {
    const fetchDriverProfile = async () => {
      if (!profile?.id) return;
      try {
        const { data } = await supabase
          .from('driver_profiles')
          .select('*')
          .eq('id', profile.id)
          .single();
        if (data) setDriverProfile(data);
      } catch (_) {}
    };
    fetchDriverProfile();
  }, [profile?.id]);

  const animateCheckmarks = useCallback(() => {
    const animations = carriers.map((_, index) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          Animated.timing(checkAnimations[index], {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }).start();
          setAppliedIndices((prev) => new Set([...prev, index]));
          resolve();
        }, index * 150);
      });
    });

    return Promise.all(animations);
  }, [carriers, checkAnimations]);

  const handleConfirm = async () => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const applications = carriers.map((carrier) => ({
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

      // Run checkmark animation sequence then navigate
      await animateCheckmarks();

      // Wait for the last animation to complete
      setTimeout(() => {
        navigation.replace('ApplySuccess', { count: carriers.length });
      }, carriers.length * 150 + 400);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to submit applications.');
      setLoading(false);
    }
  };

  const getExperienceLabel = (): string => {
    if (!driverProfile) return 'Not specified';
    if (driverProfile.is_fresh_graduate) return 'Fresh Graduate';
    const months = driverProfile.months_experience || 0;
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    return `${years}+ year${years > 1 ? 's' : ''}`;
  };

  const renderCarrier = ({ item, index }: { item: Carrier; index: number }) => {
    const isApplied = appliedIndices.has(index);
    const checkOpacity = checkAnimations[index];
    const checkScale = checkAnimations[index].interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });

    return (
      <Card padding={14} style={{ marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              backgroundColor: COLORS.navyMid,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Truck size={16} color={COLORS.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.medium }}>
              {item.company_name}
            </Text>
            <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular }}>
              {item.pay_range} · {item.home_time}
            </Text>
          </View>
          <Animated.View
            style={{
              opacity: checkOpacity,
              transform: [{ scale: checkScale }],
              width: 28,
              height: 28,
              borderRadius: 14,
              backgroundColor: isApplied ? 'rgba(34,197,94,0.15)' : 'transparent',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Check size={16} color={COLORS.success} />
          </Animated.View>
        </View>
      </Card>
    );
  };

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: 16 }}>
        <Text style={{ color: COLORS.white, fontSize: 24, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 24, marginBottom: 4 }}>
          Apply to All Carriers
        </Text>
        <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.regular, marginBottom: 20 }}>
          Review your profile and confirm
        </Text>

        {/* Profile Summary */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.medium, marginBottom: 12 }}>
            YOUR PROFILE SUMMARY
          </Text>

          <View style={{ gap: 8, marginBottom: 16 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular }}>CDL Class</Text>
              <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: FONTS.medium }}>
                {driverProfile?.cdl_class ? `Class ${driverProfile.cdl_class}` : 'Not specified'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular }}>Experience</Text>
              <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: FONTS.medium }}>
                {getExperienceLabel()}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular }}>Location</Text>
              <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: FONTS.medium }}>
                {driverProfile?.current_address?.zip || driverProfile?.state_issued || 'Not specified'}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular }}>Equipment</Text>
              <Text style={{ color: COLORS.white, fontSize: 13, fontFamily: FONTS.medium }}>
                {(driverProfile?.equipment_preference || []).length > 0
                  ? driverProfile!.equipment_preference.join(', ')
                  : 'Not specified'}
              </Text>
            </View>
          </View>

          <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.medium, marginBottom: 8 }}>
            PROFILE COMPLETENESS
          </Text>
          <ProgressBar progress={completeness / 100} showLabel height={8} />
        </Card>

        {/* Carrier List with checkmarks */}
        <Text style={{ color: COLORS.white, fontSize: 16, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 16, marginBottom: 12 }}>
          Applying to {carriers.length} carriers:
        </Text>

        <View style={{ gap: 0, marginBottom: 24 }}>
          {carriers.map((carrier, index) => renderCarrier({ item: carrier, index }))}
        </View>

        <Button
          title="Confirm & Apply"
          onPress={handleConfirm}
          loading={loading}
        />
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
