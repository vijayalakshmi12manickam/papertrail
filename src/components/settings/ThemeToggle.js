import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

const OPTIONS = [
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
  { label: 'System', value: 'system' },
];

export default function ThemeToggle() {
  const { theme, preference, setThemePreference } = useAppTheme();

  return (
    <View
      style={{
        flexDirection: 'row',
        backgroundColor: theme.colors.surfaceAlt,
        borderRadius: theme.radius.md,
        padding: 4,
      }}
    >
      {OPTIONS.map((opt) => {
        const active = preference === opt.value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => setThemePreference(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              alignItems: 'center',
              borderRadius: theme.radius.sm,
              backgroundColor: active ? theme.colors.surface : 'transparent',
            }}
          >
            <Text
              style={[
                theme.typography.bodyStrong,
                { color: active ? theme.colors.textPrimary : theme.colors.textSecondary },
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
