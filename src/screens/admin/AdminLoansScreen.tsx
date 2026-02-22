import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS, FONTS } from '../../constants';
import { supabase } from '../../lib/supabase';
import { LoanApplication } from '../../types';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'funded', 'declined'] as const;
type StatusFilter = typeof STATUS_OPTIONS[number];

const statusColors: Record<string, string> = {
  new: COLORS.amber,
  contacted: '#3B82F6',
  funded: COLORS.success,
  declined: COLORS.error,
};

export default function AdminLoansScreen() {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, [filter]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      let query = supabase.from('loan_applications').select('*').order('submitted_at', { ascending: false });
      if (filter !== 'all') {
        query = query.eq('status', filter);
      }
      const { data, error } = await query;
      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('loan_applications')
        .update({ status: newStatus })
        .eq('id', id);
      if (error) throw error;
      fetchApplications();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const renderApplication = ({ item }: { item: LoanApplication }) => (
    <Card style={{ marginBottom: 12 }} padding={16}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.white, fontSize: 16, fontFamily: FONTS.semibold }}>
            {item.full_name}
          </Text>
          <Text style={{ color: COLORS.slate, fontSize: 13, fontFamily: FONTS.regular, marginTop: 2 }}>
            {item.email} · {item.phone}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: `${statusColors[item.status] || COLORS.slate}20`,
            borderRadius: 8,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ color: statusColors[item.status] || COLORS.slate, fontSize: 12, fontFamily: FONTS.semibold, textTransform: 'uppercase' }}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 20, marginBottom: 10 }}>
        <View>
          <Text style={{ color: COLORS.slate, fontSize: 11, fontFamily: FONTS.medium }}>AMOUNT</Text>
          <Text style={{ color: COLORS.amber, fontSize: 15, fontFamily: FONTS.semibold }}>
            ${item.loan_amount.toLocaleString()}
          </Text>
        </View>
        <View>
          <Text style={{ color: COLORS.slate, fontSize: 11, fontFamily: FONTS.medium }}>INCOME</Text>
          <Text style={{ color: COLORS.white, fontSize: 15, fontFamily: FONTS.regular }}>
            ${item.monthly_income.toLocaleString()}/mo
          </Text>
        </View>
        <View>
          <Text style={{ color: COLORS.slate, fontSize: 11, fontFamily: FONTS.medium }}>ZIP</Text>
          <Text style={{ color: COLORS.white, fontSize: 15, fontFamily: FONTS.regular }}>{item.zip_code}</Text>
        </View>
      </View>

      <Text style={{ color: COLORS.slate, fontSize: 12, fontFamily: FONTS.regular, marginBottom: 10 }}>
        {item.employment_status} · Submitted {new Date(item.submitted_at).toLocaleDateString()}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['new', 'contacted', 'funded', 'declined'].filter(s => s !== item.status).map((status) => (
          <Button
            key={status}
            title={status.charAt(0).toUpperCase() + status.slice(1)}
            variant="outline"
            size="sm"
            fullWidth={false}
            onPress={() => updateStatus(item.id, status)}
            style={{ paddingHorizontal: 12 }}
          />
        ))}
      </View>
    </Card>
  );

  return (
    <ScreenWrapper scrollable={false} padding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <Text style={{ color: COLORS.white, fontSize: 24, fontFamily: FONTS.semibold, letterSpacing: -0.02 * 24, marginBottom: 16 }}>
          Loan Applications
        </Text>

        {/* Filter */}
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={STATUS_OPTIONS}
          keyExtractor={(item) => item}
          style={{ marginBottom: 16, maxHeight: 40 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setFilter(item)}
              style={{
                backgroundColor: filter === item ? COLORS.amber : COLORS.navyLight,
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 8,
                marginRight: 8,
              }}
            >
              <Text
                style={{
                  color: filter === item ? COLORS.navy : COLORS.slate,
                  fontSize: 13,
                  fontFamily: FONTS.medium,
                  textTransform: 'capitalize',
                }}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderApplication}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 20 }}
        refreshing={loading}
        onRefresh={fetchApplications}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 40 }}>
            <Text style={{ color: COLORS.slate, fontSize: 15, fontFamily: FONTS.regular }}>No applications found</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
