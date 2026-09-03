import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

// options: [{ label, value }]
export default function SegmentedControl({ options, value, onChange, style }) {
  const { theme } = useAppTheme();

  return (
    <View
      style={[
        {
          flexDirection: 'row',
          backgroundColor: theme.colors.surfaceAlt,
          borderRadius: theme.radius.pill,
          padding: 4,
        },
        style,
      ]}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={String(opt.value)}
            onPress={() => onChange(opt.value)}
            style={{
              flex: 1,
              paddingVertical: 8,
              borderRadius: theme.radius.pill,
              backgroundColor: active ? theme.colors.surface : 'transparent',
              alignItems: 'center',
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
