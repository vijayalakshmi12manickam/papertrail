import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

// A person with shared-expense/settlement history but a net balance of zero —
// nothing currently owed either way, but still worth being able to open and
// review (see PersonDetailContent's settlement history).
export default function SettledPersonRow({ personName, onPress }) {
  const { theme } = useAppTheme();

  return (
    <Pressable
      onPress={() => onPress(personName)}
      style={({ pressed }) => [
        styles.row,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          padding: theme.spacing.md,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]}>{personName}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} style={{ marginRight: 6 }} />
        <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>Settled up</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    marginBottom: 8,
  },
});
