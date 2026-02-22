import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  FlatList,
  StyleSheet,
} from 'react-native';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ChevronDown, MoreVertical } from 'lucide-react-native';
import { COLORS, FONTS, SPACING, STUDY_CATEGORIES } from '../../constants';
import { QuizCategory } from '../../types';
import { useQuizSessions } from '../../hooks/useQuizSessions';
import { useAuthContext } from '../../lib/AuthContext';
import ScreenWrapper from '../../components/common/ScreenWrapper';

export default function StudyCategoryScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<any>>();
  const { user } = useAuthContext();
  const { getStatsForCategory, loadSessions } = useQuizSessions(user?.id);
  const isFocused = useIsFocused();

  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>(
    STUDY_CATEGORIES[0]
  );
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (isFocused) {
      loadSessions();
    }
  }, [isFocused, loadSessions]);

  const stats = getStatsForCategory(selectedCategory);

  const formatStudyTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const handleSelectCategory = useCallback((category: QuizCategory) => {
    setSelectedCategory(category);
    setShowPicker(false);
  }, []);

  return (
    <ScreenWrapper scrollable={false}>
      <View style={styles.container}>
        {/* Top Bar */}
        <View style={styles.topBar}>
          <TouchableOpacity
            style={styles.categorySelector}
            onPress={() => setShowPicker(true)}
          >
            <Text style={styles.categoryTitle}>{selectedCategory}</Text>
            <ChevronDown size={20} color={COLORS.white} />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <MoreVertical size={22} color={COLORS.white} />
          </TouchableOpacity>
        </View>

        {/* Center Mode Buttons */}
        <View style={styles.centerSection}>
          <TouchableOpacity
            style={styles.modeButton}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('PracticeSession', {
                category: selectedCategory,
              })
            }
          >
            <Text style={styles.modeButtonText}>Practice Mode</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.modeButton}
            activeOpacity={0.7}
            onPress={() =>
              navigation.navigate('ExamSetup', {
                category: selectedCategory,
              })
            }
          >
            <Text style={styles.modeButtonText}>Exam Mode</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Stats Card */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Topic Results</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Exam Attempts</Text>
              <Text style={styles.statValue}>{stats.examAttempts}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Avg Exam Score</Text>
              <Text style={styles.statValue}>{stats.avgExamScore}%</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Practice Answered</Text>
              <Text style={styles.statValue}>{stats.practiceAnswered}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Practice Correct</Text>
              <Text style={styles.statValue}>{stats.practiceCorrect}</Text>
            </View>
          </View>
          <Text style={styles.studyTime}>
            Study Time: {formatStudyTime(stats.totalStudyTime)}
          </Text>
        </View>
      </View>

      {/* Category Picker Modal */}
      <Modal
        visible={showPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPicker(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Category</Text>
            <FlatList
              data={STUDY_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => handleSelectCategory(item)}
                >
                  <Text
                    style={[
                      styles.modalItemText,
                      item === selectedCategory && styles.modalItemSelected,
                    ]}
                  >
                    {item}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.sm,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontFamily: FONTS.semibold,
  },
  centerSection: {
    gap: 16,
  },
  modeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.white,
    borderRadius: 12,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
  },
  statsCard: {
    backgroundColor: COLORS.navyLight,
    borderRadius: 16,
    padding: SPACING.cardPadding,
  },
  statsTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statRow: {
    width: '50%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingRight: SPACING.md,
    marginBottom: SPACING.sm,
  },
  statLabel: {
    color: COLORS.slate,
    fontSize: 13,
    fontFamily: FONTS.regular,
  },
  statValue: {
    color: COLORS.white,
    fontSize: 15,
    fontFamily: FONTS.semibold,
  },
  studyTime: {
    color: COLORS.slate,
    fontSize: 13,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.navyLight,
    borderRadius: 16,
    padding: SPACING.lg,
    width: '85%',
    maxHeight: '60%',
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontFamily: FONTS.semibold,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  modalItem: {
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: 8,
  },
  modalItemText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.regular,
  },
  modalItemSelected: {
    color: COLORS.amber,
    fontFamily: FONTS.semibold,
  },
});
