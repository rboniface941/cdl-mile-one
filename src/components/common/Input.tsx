import React from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { COLORS } from '../../constants';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerStyle?: ViewStyle;
}

export default function Input({ label, error, containerStyle, style, ...props }: InputProps) {
  return (
    <View style={[{ marginBottom: 16 }, containerStyle]}>
      {label && (
        <Text
          style={{
            color: COLORS.gray[300],
            fontSize: 14,
            fontWeight: '500',
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={COLORS.gray[500]}
        style={[
          {
            backgroundColor: COLORS.navyLight,
            borderWidth: 1,
            borderColor: error ? COLORS.error : 'rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: 14,
            color: COLORS.white,
            fontSize: 16,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text style={{ color: COLORS.error, fontSize: 12, marginTop: 4 }}>{error}</Text>
      )}
    </View>
  );
}
