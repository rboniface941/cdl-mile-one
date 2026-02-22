import React from 'react';
import { View, Text, TextInput, TextInputProps, ViewStyle } from 'react-native';
import { COLORS, FONTS } from '../../constants';

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
            color: COLORS.slate,
            fontSize: 14,
            fontFamily: FONTS.medium,
            marginBottom: 8,
          }}
        >
          {label}
        </Text>
      )}
      <TextInput
        placeholderTextColor={COLORS.navyMid}
        style={[
          {
            backgroundColor: COLORS.navyLight,
            borderWidth: 1,
            borderColor: error ? COLORS.error : COLORS.navyMid,
            borderRadius: 12,
            padding: 14,
            color: COLORS.white,
            fontSize: 16,
            fontFamily: FONTS.regular,
          },
          style,
        ]}
        {...props}
      />
      {error && (
        <Text style={{ color: COLORS.error, fontSize: 13, fontFamily: FONTS.regular, marginTop: 4 }}>
          {error}
        </Text>
      )}
    </View>
  );
}
