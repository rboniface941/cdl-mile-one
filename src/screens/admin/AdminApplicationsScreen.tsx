import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, Share } from 'react-native';
import ScreenWrapper from '../../components/common/ScreenWrapper';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { COLORS } from '../../constants';
import { supabase } from '../../lib/supabase';

interface ApplicationWithDetails {
  id: number;
  user_id: string;
  carrier_id: number;
  applied_at: string;
  status: string;
  carriers: {
    company_name: string;
    job_title: string;
  };
  profiles: {
    full_name: string;
    email: string;
    phone: string;
  };
}

export default function AdminApplicationsScreen() {
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('applications')
        .select('*, carriers(company_name, job_title), profiles(full_name, email, phone)')
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportCSV = async () => {
    try {
      const headers = 'ID,Applicant,Email,Phone,Carrier,Job Title,Applied At,Status\n';
      const rows = applications.map(a =>
        `${a.id},"${a.profiles?.full_name || ''}","${a.profiles?.email || ''}","${a.profiles?.phone || ''}","${a.carriers?.company_name || ''}","${a.carriers?.job_title || ''}","${a.applied_at}","${a.status}"`
      ).join('\n');

      const csv = headers + rows;
      await Share.share({ message: csv, title: 'Applications Export' });
    } catch (err) {
      Alert.alert('Error', 'Failed to export CSV');
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      fetchApplications();
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
  };

  const renderApplication = ({ item }: { item: ApplicationWithDetails }) => (
    <Card style={{ marginBottom: 12 }} padding={16}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: COLORS.white, fontSize: 16, fontWeight: '700' }}>
            {item.profiles?.full_name || 'Unknown'}
          </Text>
          <Text style={{ color: COLORS.gray[400], fontSize: 12, marginTop: 2 }}>
            {item.profiles?.email} · {item.profiles?.phone}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: 'rgba(245,158,11,0.12)',
            borderRadius: 8,
            paddingHorizontal: 8,
            paddingVertical: 3,
          }}
        >
          <Text style={{ color: COLORS.amber, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' }}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 16, marginBottom: 10 }}>
        <View>
          <Text style={{ color: COLORS.gray[500], fontSize: 11 }}>CARRIER</Text>
          <Text style={{ color: COLORS.white, fontSize: 14 }}>{item.carriers?.company_name}</Text>
        </View>
        <View>
          <Text style={{ color: COLORS.gray[500], fontSize: 11 }}>POSITION</Text>
          <Text style={{ color: COLORS.white, fontSize: 14 }}>{item.carriers?.job_title}</Text>
        </View>
      </View>

      <Text style={{ color: COLORS.gray[500], fontSize: 12, marginBottom: 10 }}>
        Applied {new Date(item.applied_at).toLocaleDateString()}
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {['submitted', 'reviewed', 'interview', 'hired', 'rejected']
          .filter(s => s !== item.status)
          .slice(0, 3)
          .map((status) => (
            <Button
              key={status}
              title={status.charAt(0).toUpperCase() + status.slice(1)}
              variant="outline"
              size="sm"
              fullWidth={false}
              onPress={() => updateStatus(item.id, status)}
              style={{ paddingHorizontal: 10 }}
            />
          ))}
      </View>
    </Card>
  );

  return (
    <ScreenWrapper scrollable={false} padding={false}>
      <View style={{ paddingHorizontal: 20, paddingTop: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: COLORS.white, fontSize: 24, fontWeight: '800' }}>
            Job Applications
          </Text>
          <Button
            title="Export CSV"
            variant="outline"
            size="sm"
            fullWidth={false}
            onPress={exportCSV}
            style={{ paddingHorizontal: 14 }}
          />
        </View>

        <Text style={{ color: COLORS.gray[400], fontSize: 14, marginBottom: 16 }}>
          {applications.length} total applications
        </Text>
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
            <Text style={{ color: COLORS.gray[500], fontSize: 15 }}>No applications yet</Text>
          </View>
        }
      />
    </ScreenWrapper>
  );
}
