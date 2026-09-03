import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

export default function Button({ title, onPress, variant = 'primary', loading, disabled, style }) {
  const { theme } = useAppTheme();
  const isOutline = variant === 'outline';

  const bg = isOutline ? 'transparent' : theme.colors.primary;
  const textColor = isOutline ? theme.colors.primary : '#FFFFFF';
  const borderColor = isOutline ? theme.colors.primary : 'transparent';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: bg,
          borderColor,
          borderWidth: isOutline ? 1.5 : 0,
          opacity: pressed ? 0.85 : disabled ? 0.5 : 1,
          borderRadius: theme.radius.md,
          paddingVertical: theme.spacing.md * 0.7,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[theme.typography.bodyStrong, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
