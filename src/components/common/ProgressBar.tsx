import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { COLORS, FONTS } from '../../constants';

interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  showLabel?: boolean;
  label?: string;
  color?: string;
  backgroundColor?: string;
  style?: ViewStyle;
}

export default function ProgressBar({
  progress,
  height = 4,
  showLabel = false,
  label,
  color = COLORS.amber,
  backgroundColor = COLORS.navyLight,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={style}>
      {showLabel && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && (
            <Text style={{ color: COLORS.slate, fontSize: 14, fontFamily: FONTS.regular }}>
              {label}
            </Text>
          )}
          <Text style={{ color: COLORS.white, fontSize: 14, fontFamily: FONTS.semibold }}>
            {Math.round(clampedProgress * 100)}%
          </Text>
        </View>
      )}
      <View
        style={{
          height,
          backgroundColor,
          borderRadius: height / 2,
          overflow: 'hidden',
        }}
      >
        <View
          style={{
            height: '100%',
            width: `${clampedProgress * 100}%`,
            backgroundColor: color,
            borderRadius: height / 2,
          }}
        />
      </View>
    </View>
  );
}
