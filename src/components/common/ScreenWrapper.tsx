import React from 'react';
import { View, ScrollView, ViewStyle, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING } from '../../constants';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  padding?: boolean;
}

export default function ScreenWrapper({
  children,
  scrollable = true,
  style,
  padding = true,
}: ScreenWrapperProps) {
  const content = (
    <View style={[{ flex: 1 }, padding && { paddingHorizontal: SPACING.screenPadding }, style]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.navy }}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.navy} />
      {scrollable ? (
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: SPACING.lg }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}
