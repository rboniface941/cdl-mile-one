import React from 'react';
import { View, ViewStyle } from 'react-native';
import { COLORS } from '../../constants';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  padding?: number;
}

export default function Card({ children, style, padding = 16 }: CardProps) {
  return (
    <View
      style={[
        {
          backgroundColor: COLORS.navyLight,
          borderRadius: 16,
          padding,
          borderWidth: 1,
          borderColor: 'rgba(255,255,255,0.05)',
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}
