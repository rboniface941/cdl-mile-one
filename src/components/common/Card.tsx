import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export default function Card({ children, style, padding = SPACING.cardPadding }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.navyLight,
          borderRadius: 16,
          padding,
          borderWidth: 1,
          borderColor: COLORS.navyMid,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
