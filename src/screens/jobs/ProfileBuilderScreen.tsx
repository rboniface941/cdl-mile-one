import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Switch, ScrollView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import ProgressBar from '../../components/common/ProgressBar';
import { COLORS, FONTS, ENDORSEMENTS, EQUIPMENT_TYPES, JOB_TYPES, US_STATES } from '../../constants';
import { useAuthContext } from '../../lib/AuthContext';
import { supabase } from '../../lib/supabase';
import { DriverProfile, Employer, Address } from '../../types';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

const TOTAL_STEPS = 5;

export default function ProfileBuilderScreen({ navigation }: Props) {
  const { profile, updateProfile } = useAuthContext();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [driverProfile, setDriverProfile] = useState<Partial<DriverProfile>>({
    cdl_class: null,
    state_issued: null,
    endorsements: [],
    license_expiration: null,
    job_type: null,
    equipment_preference: [],
    expected_salary: 65000,
    willing_to_relocate: false,
    months_experience: 0,
    is_fresh_graduate: true,
    previous_employers: [],
    has_accidents: false,
    accident_details: null,
    has_violations: false,
    violation_details: null,
    has_dui: false,
    current_address: null,
    previous_addresses: [],
  });

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  const fetchDriverProfile = async () => {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('driver_profiles')
      .select('*')
      .eq('id', profile.id)
      .single();
    if (data) setDriverProfile(data);
  };

  const completeness = calculateCompleteness(driverProfile);

  const saveStep = async () => {
    if (!profile?.id) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('driver_profiles')
        .upsert({
          id: profile.id,
          ...driverProfile,
          updated_at: new Date().toISOString(),
        });
      if (error) throw error;

      await updateProfile({ profile_completeness: completeness });

      if (step < TOTAL_STEPS) {
        setStep(step + 1);
      } else {
        Alert.alert('Profile Complete!', 'Your driver profile is now visible to carriers.');
        navigation.goBack();
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleEndorsement = (e: string) => {
    setDriverProfile(prev => ({
      ...prev,
      endorsements: prev.endorsements?.includes(e)
        ? prev.endorsements.filter(x => x !== e)
        : [...(prev.endorsements || []), e],
    }));
  };

  const toggleEquipment = (e: string) => {
    setDriverProfile(prev => ({
      ...prev,
      equipment_preference: prev.equipment_preference?.includes(e)
        ? prev.equipment_preference.filter(x => x !== e)
        : [...(prev.equipment_preference || []), e],
    }));
  };

  const visibleCarriers = Math.max(1, Math.round((completeness / 100) * 45));

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <View>
            <Text style={styles.stepTitle}>License Information</Text>
            <Text style={styles.stepDesc}>Tell us about your CDL</Text>

            <Text style={styles.label}>CDL Class</Text>
            <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
              {['A', 'B', 'C'].map((cls) => (
                <TouchableOpacity
                  key={cls}
                  onPress={() => setDriverProfile(p => ({ ...p, cdl_class: cls as any }))}
                  style={{
                    flex: 1,
                    backgroundColor: driverProfile.cdl_class === cls ? COLORS.amber : COLORS.navyLight,
                    borderRadius: 12,
                    padding: 16,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: driverProfile.cdl_class === cls ? COLORS.amber : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{
                    color: driverProfile.cdl_class === cls ? COLORS.navy : COLORS.white,
                    fontSize: 20,
                    fontFamily: FONTS.semibold,
                  }}>
                    Class {cls}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>State Issued</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {US_STATES.map((st) => (
                  <TouchableOpacity
                    key={st}
                    onPress={() => setDriverProfile(p => ({ ...p, state_issued: st }))}
                    style={{
                      backgroundColor: driverProfile.state_issued === st ? COLORS.amber : COLORS.navyLight,
                      borderRadius: 8,
                      paddingHorizontal: 14,
                      paddingVertical: 8,
                    }}
                  >
                    <Text style={{
                      color: driverProfile.state_issued === st ? COLORS.navy : COLORS.slate,
                      fontSize: 14,
                      fontFamily: FONTS.medium,
                    }}>
                      {st}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.label}>Endorsements</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {ENDORSEMENTS.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => toggleEndorsement(e)}
                  style={{
                    backgroundColor: driverProfile.endorsements?.includes(e) ? COLORS.amber : COLORS.navyLight,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{
                    color: driverProfile.endorsements?.includes(e) ? COLORS.navy : COLORS.slate,
                    fontSize: 14,
                    fontFamily: FONTS.medium,
                  }}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Input
              label="License Expiration (MM/YYYY)"
              placeholder="12/2027"
              value={driverProfile.license_expiration || ''}
              onChangeText={(val) => setDriverProfile(p => ({ ...p, license_expiration: val }))}
            />
          </View>
        );

      case 2:
        return (
          <View>
            <Text style={styles.stepTitle}>Job Preferences</Text>
            <Text style={styles.stepDesc}>What are you looking for?</Text>

            <Text style={styles.label}>Job Type</Text>
            <View style={{ gap: 10, marginBottom: 20 }}>
              {JOB_TYPES.map((type) => (
                <TouchableOpacity
                  key={type}
                  onPress={() => setDriverProfile(p => ({ ...p, job_type: type as any }))}
                  style={{
                    backgroundColor: driverProfile.job_type === type ? COLORS.amber : COLORS.navyLight,
                    borderRadius: 12,
                    padding: 16,
                    borderWidth: 1,
                    borderColor: driverProfile.job_type === type ? COLORS.amber : 'rgba(255,255,255,0.08)',
                  }}
                >
                  <Text style={{
                    color: driverProfile.job_type === type ? COLORS.navy : COLORS.white,
                    fontSize: 16,
                    fontFamily: FONTS.semibold,
                  }}>
                    {type === 'OTR' ? 'Over the Road (OTR)' : type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Equipment Preference</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {EQUIPMENT_TYPES.map((e) => (
                <TouchableOpacity
                  key={e}
                  onPress={() => toggleEquipment(e)}
                  style={{
                    backgroundColor: driverProfile.equipment_preference?.includes(e) ? COLORS.amber : COLORS.navyLight,
                    borderRadius: 12,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                  }}
                >
                  <Text style={{
                    color: driverProfile.equipment_preference?.includes(e) ? COLORS.navy : COLORS.slate,
                    fontSize: 14,
                    fontFamily: FONTS.medium,
                  }}>
                    {e}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>
              Expected Annual Salary: ${(driverProfile.expected_salary || 65000).toLocaleString()}
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 }}>
              {[50000, 65000, 80000, 100000].map((sal) => (
                <Button
                  key={sal}
                  title={`$${(sal / 1000).toFixed(0)}K`}
                  variant={driverProfile.expected_salary === sal ? 'primary' : 'outline'}
                  size="sm"
                  fullWidth={false}
                  onPress={() => setDriverProfile(p => ({ ...p, expected_salary: sal }))}
                  style={{ paddingHorizontal: 14 }}
                />
              ))}
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: COLORS.slate, fontSize: 15, fontFamily: FONTS.regular }}>Willing to relocate?</Text>
              <Switch
                value={driverProfile.willing_to_relocate}
                onValueChange={(val) => setDriverProfile(p => ({ ...p, willing_to_relocate: val }))}
                trackColor={{ false: COLORS.navyMid, true: COLORS.amber }}
                thumbColor={COLORS.white}
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View>
            <Text style={styles.stepTitle}>Experience</Text>
            <Text style={styles.stepDesc}>Tell us about your driving history</Text>

            <Input
              label="Months of CDL Experience"
              placeholder="0"
              value={driverProfile.months_experience?.toString() || '0'}
              onChangeText={(val) => setDriverProfile(p => ({ ...p, months_experience: parseInt(val) || 0 }))}
              keyboardType="numeric"
            />

            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ color: COLORS.slate, fontSize: 15, fontFamily: FONTS.regular }}>Fresh CDL graduate?</Text>
              <Switch
                value={driverProfile.is_fresh_graduate}
                onValueChange={(val) => setDriverProfile(p => ({ ...p, is_fresh_graduate: val }))}
                trackColor={{ false: COLORS.navyMid, true: COLORS.amber }}
                thumbColor={COLORS.white}
              />
            </View>

            <Text style={styles.label}>Previous Employers (up to 5)</Text>
            {(driverProfile.previous_employers || []).map((emp, idx) => (
              <Card key={idx} style={{ marginBottom: 10 }} padding={12}>
                <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.medium }}>{emp.name}</Text>
                <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular }}>
                  {emp.start_date} — {emp.end_date} · {emp.equipment_operated}
                </Text>
              </Card>
            ))}

            {(driverProfile.previous_employers || []).length < 5 && (
              <AddEmployerForm
                onAdd={(emp) => setDriverProfile(p => ({
                  ...p,
                  previous_employers: [...(p.previous_employers || []), emp],
                }))}
              />
            )}
          </View>
        );

      case 4:
        return (
          <View>
            <Text style={styles.stepTitle}>Violations & Safety</Text>
            <Text style={styles.stepDesc}>This information is kept confidential</Text>

            <Card style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: COLORS.white, fontSize: 15, fontFamily: FONTS.regular }}>Accidents in last 3 years?</Text>
                <Switch
                  value={driverProfile.has_accidents}
                  onValueChange={(val) => setDriverProfile(p => ({ ...p, has_accidents: val }))}
                  trackColor={{ false: COLORS.navyMid, true: COLORS.amber }}
                  thumbColor={COLORS.white}
                />
              </View>
              {driverProfile.has_accidents && (
                <Input
                  placeholder="Describe accident details..."
                  value={driverProfile.accident_details || ''}
                  onChangeText={(val) => setDriverProfile(p => ({ ...p, accident_details: val }))}
                  multiline
                  numberOfLines={3}
                  containerStyle={{ marginBottom: 0 }}
                />
              )}
            </Card>

            <Card style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={{ color: COLORS.white, fontSize: 15, fontFamily: FONTS.regular }}>Traffic violations in last 3 years?</Text>
                <Switch
                  value={driverProfile.has_violations}
                  onValueChange={(val) => setDriverProfile(p => ({ ...p, has_violations: val }))}
                  trackColor={{ false: COLORS.navyMid, true: COLORS.amber }}
                  thumbColor={COLORS.white}
                />
              </View>
              {driverProfile.has_violations && (
                <Input
                  placeholder="Describe violation details..."
                  value={driverProfile.violation_details || ''}
                  onChangeText={(val) => setDriverProfile(p => ({ ...p, violation_details: val }))}
                  multiline
                  numberOfLines={3}
                  containerStyle={{ marginBottom: 0 }}
                />
              )}
            </Card>

            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: COLORS.white, fontSize: 15, fontFamily: FONTS.regular }}>DUI/DWI in last 10 years?</Text>
                <Switch
                  value={driverProfile.has_dui}
                  onValueChange={(val) => setDriverProfile(p => ({ ...p, has_dui: val }))}
                  trackColor={{ false: COLORS.navyMid, true: COLORS.amber }}
                  thumbColor={COLORS.white}
                />
              </View>
            </Card>
          </View>
        );

      case 5:
        return (
          <View>
            <Text style={styles.stepTitle}>Address History</Text>
            <Text style={styles.stepDesc}>Last 3 years of addresses</Text>

            <Text style={styles.label}>Current Address</Text>
            <AddressForm
              address={driverProfile.current_address || { street: '', city: '', state: '', zip: '' }}
              onChange={(addr) => setDriverProfile(p => ({ ...p, current_address: addr }))}
            />

            <Text style={[styles.label, { marginTop: 16 }]}>Previous Addresses</Text>
            {(driverProfile.previous_addresses || []).map((addr, idx) => (
              <Card key={idx} style={{ marginBottom: 10 }} padding={12}>
                <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.regular }}>
                  {addr.street}, {addr.city}, {addr.state} {addr.zip}
                </Text>
              </Card>
            ))}

            {(driverProfile.previous_addresses || []).length < 3 && (
              <AddPreviousAddressForm
                onAdd={(addr) => setDriverProfile(p => ({
                  ...p,
                  previous_addresses: [...(p.previous_addresses || []), addr],
                }))}
              />
            )}
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <ScreenWrapper>
      <View style={{ paddingTop: 16 }}>
        {/* Progress Header */}
        <View style={{ marginBottom: 24 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular }}>Step {step} of {TOTAL_STEPS}</Text>
            <Text style={{ color: COLORS.amber, fontSize: 13, fontFamily: FONTS.medium }}>
              Visible to {visibleCarriers} carriers
            </Text>
          </View>
          <ProgressBar progress={step / TOTAL_STEPS} height={6} />
        </View>

        {renderStep()}

        {/* Navigation */}
        <View style={{ marginTop: 24, gap: 10 }}>
          <Button title={step === TOTAL_STEPS ? 'Complete Profile' : 'Save & Continue'} onPress={saveStep} loading={loading} />
          {step > 1 && (
            <Button title="Back" variant="ghost" onPress={() => setStep(step - 1)} />
          )}
        </View>
      </View>
    </ScreenWrapper>
  );
}

// Sub-components

function AddEmployerForm({ onAdd }: { onAdd: (emp: Employer) => void }) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [equipment, setEquipment] = useState('');
  const [reason, setReason] = useState('');
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <Button title="+ Add Employer" variant="outline" size="sm" onPress={() => setExpanded(true)} />
    );
  }

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name, start_date: startDate, end_date: endDate, equipment_operated: equipment, reason_for_leaving: reason });
    setName(''); setStartDate(''); setEndDate(''); setEquipment(''); setReason('');
    setExpanded(false);
  };

  return (
    <Card>
      <Input label="Company Name" placeholder="Company name" value={name} onChangeText={setName} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Input label="Start Date" placeholder="MM/YYYY" value={startDate} onChangeText={setStartDate} />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="End Date" placeholder="MM/YYYY" value={endDate} onChangeText={setEndDate} />
        </View>
      </View>
      <Input label="Equipment Operated" placeholder="Dry Van, Flatbed..." value={equipment} onChangeText={setEquipment} />
      <Input label="Reason for Leaving" placeholder="Reason" value={reason} onChangeText={setReason} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Add" onPress={handleAdd} size="sm" style={{ flex: 1 }} />
        <Button title="Cancel" variant="ghost" size="sm" onPress={() => setExpanded(false)} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

function AddressForm({ address, onChange }: { address: Address; onChange: (a: Address) => void }) {
  return (
    <View>
      <Input label="Street" placeholder="123 Main St" value={address.street} onChangeText={(v) => onChange({ ...address, street: v })} />
      <Input label="City" placeholder="City" value={address.city} onChangeText={(v) => onChange({ ...address, city: v })} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ flex: 1 }}>
          <Input label="State" placeholder="TX" value={address.state} onChangeText={(v) => onChange({ ...address, state: v })} maxLength={2} autoCapitalize="characters" />
        </View>
        <View style={{ flex: 1 }}>
          <Input label="Zip" placeholder="12345" value={address.zip} onChangeText={(v) => onChange({ ...address, zip: v })} keyboardType="numeric" maxLength={5} />
        </View>
      </View>
    </View>
  );
}

function AddPreviousAddressForm({ onAdd }: { onAdd: (addr: Address) => void }) {
  const [address, setAddress] = useState<Address>({ street: '', city: '', state: '', zip: '' });
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return (
      <Button title="+ Add Previous Address" variant="outline" size="sm" onPress={() => setExpanded(true)} />
    );
  }

  const handleAdd = () => {
    if (!address.street.trim()) return;
    onAdd(address);
    setAddress({ street: '', city: '', state: '', zip: '' });
    setExpanded(false);
  };

  return (
    <Card>
      <AddressForm address={address} onChange={setAddress} />
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Add" onPress={handleAdd} size="sm" style={{ flex: 1 }} />
        <Button title="Cancel" variant="ghost" size="sm" onPress={() => setExpanded(false)} style={{ flex: 1 }} />
      </View>
    </Card>
  );
}

function calculateCompleteness(dp: Partial<DriverProfile>): number {
  let score = 0;
  const total = 10;

  if (dp.cdl_class) score++;
  if (dp.state_issued) score++;
  if (dp.endorsements && dp.endorsements.length > 0) score++;
  if (dp.job_type) score++;
  if (dp.equipment_preference && dp.equipment_preference.length > 0) score++;
  if (dp.expected_salary) score++;
  if (dp.months_experience !== undefined && dp.months_experience !== null) score++;
  if (dp.has_accidents !== undefined && dp.has_accidents !== null) score++;
  if (dp.current_address && dp.current_address.street) score++;
  if (dp.license_expiration) score++;

  return Math.round((score / total) * 100);
}

const styles = {
  stepTitle: {
    color: COLORS.white,
    fontSize: 24,
    fontFamily: FONTS.semibold,
    letterSpacing: -0.02 * 24,
    marginBottom: 4,
  },
  stepDesc: {
    color: COLORS.slate,
    fontSize: 14,
    fontFamily: FONTS.regular,
    marginBottom: 24,
  },
  label: {
    color: COLORS.slate,
    fontSize: 14,
    fontFamily: FONTS.medium,
    marginBottom: 10,
  },
};
