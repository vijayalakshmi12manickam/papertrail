import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

export default function TextField({ label, error, style, ...inputProps }) {
  const { theme } = useAppTheme();
  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        placeholderTextColor={theme.colors.textMuted}
        style={[
          theme.typography.body,
          {
            color: theme.colors.textPrimary,
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderWidth: 1,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing.md,
            paddingVertical: theme.spacing.sm + 2,
          },
        ]}
        {...inputProps}
      />
      {error ? (
        <Text style={[theme.typography.caption, { color: theme.colors.danger, marginTop: 4 }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
});
