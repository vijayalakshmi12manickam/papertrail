import React, { useState } from 'react';
import { View, Text, Pressable, FlatList } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { getCurrencySymbol } from '../../lib/format';
import Modal from '../common/Modal';

// Compact "GBP £" pill for the Dashboard header — tapping opens the full list
// of currencies the user has expenses/settings in to switch the display currency.
export default function CurrencySwitcher({ value, options, onChange }) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const symbol = getCurrencySymbol(value);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        hitSlop={6}
        style={({ pressed }) => [
          {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: theme.radius.pill,
            backgroundColor: theme.colors.surfaceAlt,
            borderWidth: 1,
            borderColor: theme.colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]}>
          {value}
          {symbol !== value ? ` ${symbol}` : ''}
        </Text>
        <Text style={{ color: theme.colors.textMuted, marginLeft: 4, fontSize: 10 }}>▾</Text>
      </Pressable>

      <Modal visible={open} onClose={() => setOpen(false)} title="Display currency">
        <FlatList
          data={options}
          keyExtractor={(item) => String(item.value)}
          contentContainerStyle={{ padding: theme.spacing.md }}
          renderItem={({ item }) => {
            const itemSymbol = getCurrencySymbol(item.value);
            const active = item.value === value;
            return (
              <Pressable
                onPress={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: theme.spacing.md,
                  borderRadius: theme.radius.sm,
                  backgroundColor: active ? theme.colors.surfaceAlt : 'transparent',
                }}
              >
                <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                  {item.label}
                  {itemSymbol !== item.label ? ` ${itemSymbol}` : ''}
                </Text>
              </Pressable>
            );
          }}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
      </Modal>
    </>
  );
}
