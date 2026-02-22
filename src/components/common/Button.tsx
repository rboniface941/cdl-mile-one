import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS } from '../../constants';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

export default function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
  fullWidth = true,
}: ButtonProps) {
  const baseStyle: ViewStyle = {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    ...(fullWidth ? { width: '100%' } : {}),
  };

  const sizeStyles: Record<string, ViewStyle> = {
    sm: { height: 40, paddingHorizontal: 16 },
    md: { height: 56, paddingHorizontal: 24 },
    lg: { height: 56, paddingHorizontal: 32 },
  };

  const variantStyles: Record<string, ViewStyle> = {
    primary: { backgroundColor: COLORS.amber },
    secondary: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.slate,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: COLORS.slate,
    },
    ghost: { backgroundColor: 'transparent' },
  };

  const textColors: Record<string, string> = {
    primary: COLORS.navy,
    secondary: COLORS.white,
    outline: COLORS.white,
    ghost: COLORS.slate,
  };

  const textSizes: Record<string, TextStyle> = {
    sm: { fontSize: 14 },
    md: { fontSize: 16 },
    lg: { fontSize: 16 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        baseStyle,
        sizeStyles[size],
        variantStyles[variant],
        (disabled || loading) && { opacity: 0.5 },
        style,
      ]}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={textColors[variant]} size="small" />
      ) : (
        <Text
          style={[
            {
              color: textColors[variant],
              fontFamily: FONTS.semibold,
            },
            textSizes[size],
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}
