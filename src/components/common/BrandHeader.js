import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

// Simple in-app logo placeholder: a finance-related icon + wordmark, used on
// the Dashboard header and the Auth screens until a real logo asset exists.
export default function BrandHeader({ size = 22, textStyle }) {
  const { theme } = useAppTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Ionicons name="wallet" size={size} color={theme.colors.accent} style={{ marginRight: 8 }} />
      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }, textStyle]}>PaperTrail</Text>
    </View>
  );
}
