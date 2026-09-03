import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';

export default function CollapsibleSection({ title, defaultOpen = true, children }) {
  const { theme } = useAppTheme();
  const [open, setOpen] = useState(defaultOpen);

  return (
    <View>
      <Pressable
        onPress={() => setOpen((o) => !o)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}
        hitSlop={4}
      >
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>{title}</Text>
        <Ionicons name={open ? 'chevron-up' : 'chevron-down'} size={18} color={theme.colors.textSecondary} />
      </Pressable>
      {open ? <View style={{ marginTop: theme.spacing.sm }}>{children}</View> : null}
    </View>
  );
}
