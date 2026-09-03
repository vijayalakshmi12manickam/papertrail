import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import TextField from '../common/TextField';
import Button from '../common/Button';

export default function ManagedListSection({ title, items, onAdd, onDelete, adding, namePlaceholder = 'Name' }) {
  const { theme } = useAppTheme();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), icon: icon.trim() || undefined, order: items.length });
    setName('');
    setIcon('');
  };

  return (
    <View>
      <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
        {title}
      </Text>

      {items.map((item) => (
        <View
          key={item.id}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.border,
          }}
        >
          <Text style={[theme.typography.body, { color: theme.colors.textPrimary }]}>
            {item.icon ? `${item.icon} ` : ''}
            {item.name}
          </Text>
          <Pressable onPress={() => onDelete(item.id)} hitSlop={10}>
            <Text style={{ color: theme.colors.danger, fontSize: 18 }}>×</Text>
          </Pressable>
        </View>
      ))}

      <View style={{ flexDirection: 'row', marginTop: theme.spacing.sm, alignItems: 'flex-end' }}>
        <View style={{ width: 56, marginRight: theme.spacing.sm }}>
          <TextField placeholder="🏷️" value={icon} onChangeText={setIcon} maxLength={2} />
        </View>
        <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
          <TextField placeholder={namePlaceholder} value={name} onChangeText={setName} />
        </View>
        <Button title="Add" onPress={handleAdd} loading={adding} style={{ paddingHorizontal: 16 }} />
      </View>
    </View>
  );
}
