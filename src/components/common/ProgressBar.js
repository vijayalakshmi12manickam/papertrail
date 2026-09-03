import React from 'react';
import { View } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

// percent is a fraction (0-1); can exceed 1 when over budget, in which case
// the filled track is visually clamped to 100% but callers should still pass
// a "danger" color so the overage is obvious from the color alone.
export default function ProgressBar({ percent, color }) {
  const { theme } = useAppTheme();
  const clamped = Math.max(0, Math.min(percent, 1));

  return (
    <View
      style={{
        height: 8,
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.surfaceAlt,
        overflow: 'hidden',
      }}
    >
      <View
        style={{
          height: '100%',
          width: `${clamped * 100}%`,
          backgroundColor: color || theme.colors.accent,
          borderRadius: theme.radius.pill,
        }}
      />
    </View>
  );
}
