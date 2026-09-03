import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

export default function TextField({ label, error, style, secureTextEntry, ...inputProps }) {
  const { theme } = useAppTheme();
  const [revealed, setRevealed] = useState(false);
  const isPasswordField = !!secureTextEntry;

  return (
    <View style={[styles.wrap, style]}>
      {label ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
          {label}
        </Text>
      ) : null}
      <View style={{ justifyContent: 'center' }}>
        <TextInput
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isPasswordField && !revealed}
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
              paddingRight: isPasswordField ? 44 : theme.spacing.md,
            },
          ]}
          {...inputProps}
        />
        {isPasswordField ? (
          <Pressable
            onPress={() => setRevealed((r) => !r)}
            hitSlop={10}
            style={{ position: 'absolute', right: 12 }}
          >
            <Ionicons name={revealed ? 'eye-off' : 'eye'} size={20} color={theme.colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
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
