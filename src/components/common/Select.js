import React, { useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import Modal from './Modal';

// options: [{ label, value, icon? }]
export default function Select({ label, value, options, onChange, placeholder = 'Select...', error, style }) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={[{ marginBottom: 4 }, style]}>
      {label ? (
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
          {label}
        </Text>
      ) : null}
      <Pressable
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          {
            backgroundColor: theme.colors.surface,
            borderColor: error ? theme.colors.danger : theme.colors.border,
            borderRadius: theme.radius.sm,
            paddingHorizontal: theme.spacing.md,
          },
        ]}
      >
        <Text
          style={[
            theme.typography.body,
            { color: selected ? theme.colors.textPrimary : theme.colors.textMuted },
          ]}
        >
          {selected ? `${selected.icon ? selected.icon + ' ' : ''}${selected.label}` : placeholder}
        </Text>
        <Text style={{ color: theme.colors.textMuted }}>▾</Text>
      </Pressable>
      {error ? (
        <Text style={[theme.typography.caption, { color: theme.colors.danger, marginTop: 4 }]}>{error}</Text>
      ) : null}

      <Modal visible={open} onClose={() => setOpen(false)} title={label || 'Select'}>
        <FlatList
          data={options}
          keyExtractor={(item) => String(item.value)}
          contentContainerStyle={{ padding: theme.spacing.md }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => {
                onChange(item.value);
                setOpen(false);
              }}
              style={[
                styles.option,
                {
                  backgroundColor:
                    item.value === value ? theme.colors.surfaceAlt : 'transparent',
                  borderRadius: theme.radius.sm,
                  paddingHorizontal: theme.spacing.md,
                },
              ]}
            >
              <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
                {item.icon ? `${item.icon} ` : ''}
                {item.label}
              </Text>
            </Pressable>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    paddingVertical: 12,
  },
  option: {
    paddingVertical: 14,
  },
});
