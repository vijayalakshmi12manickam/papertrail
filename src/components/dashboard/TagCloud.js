import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';

const MIN_SIZE = 13;
const MAX_SIZE = 30;

export default function TagCloud({ tagTotals, selectedTag, onSelectTag }) {
  const { theme } = useAppTheme();

  if (tagTotals.length === 0) {
    return <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>No tags used yet.</Text>;
  }

  const max = Math.max(...tagTotals.map((t) => t.total), 1);
  const min = Math.min(...tagTotals.map((t) => t.total), 0);

  const sizeFor = (total) => {
    if (max === min) return (MIN_SIZE + MAX_SIZE) / 2;
    const ratio = (total - min) / (max - min);
    return MIN_SIZE + ratio * (MAX_SIZE - MIN_SIZE);
  };

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10 }}>
      {tagTotals.map(({ tag, total }) => {
        const active = selectedTag === tag;
        return (
          <Pressable key={tag} onPress={() => onSelectTag(active ? null : tag)} hitSlop={4}>
            <Text
              style={{
                fontSize: sizeFor(total),
                fontWeight: active ? '800' : '600',
                color: active ? theme.colors.accent : theme.colors.textSecondary,
              }}
            >
              #{tag}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
