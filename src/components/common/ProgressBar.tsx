import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { COLORS } from '../../constants';

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
  height = 8,
  showLabel = false,
  label,
  color = COLORS.amber,
  backgroundColor = COLORS.navyMid,
  style,
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 1);

  return (
    <View style={style}>
      {showLabel && (
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          {label && (
            <Text style={{ color: COLORS.gray[400], fontSize: 13 }}>{label}</Text>
          )}
          <Text style={{ color: COLORS.white, fontSize: 13, fontWeight: '600' }}>
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
