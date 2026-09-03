import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import TextField from '../common/TextField';

const INPUT_LABEL = {
  equal: null, // no input needed, split is automatic
  percentage: '%',
  shares: 'Shares',
  custom: 'Amount',
};

export default function ParticipantRow({ participant, splitType, computedAmount, onChange, onRemove, canRemove }) {
  const { theme } = useAppTheme();
  const inputLabel = INPUT_LABEL[splitType];

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: theme.spacing.sm }}>
      <View style={{ flex: 1.3, marginRight: theme.spacing.sm }}>
        <TextField
          placeholder="Name"
          value={participant.name}
          onChangeText={(v) => onChange({ ...participant, name: v })}
        />
      </View>

      {inputLabel ? (
        <View style={{ flex: 0.9, marginRight: theme.spacing.sm }}>
          <TextField
            placeholder={inputLabel}
            keyboardType="decimal-pad"
            value={participant.input}
            onChangeText={(v) => onChange({ ...participant, input: v })}
          />
        </View>
      ) : (
        <View style={{ flex: 0.9, marginRight: theme.spacing.sm, justifyContent: 'center', paddingTop: 10 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textMuted }]}>
            {computedAmount != null ? computedAmount.toFixed(2) : '—'}
          </Text>
        </View>
      )}

      {canRemove ? (
        <Pressable onPress={onRemove} hitSlop={10} style={{ paddingTop: 10 }}>
          <Text style={{ color: theme.colors.danger, fontSize: 18 }}>×</Text>
        </Pressable>
      ) : (
        <View style={{ width: 18 }} />
      )}
    </View>
  );
}
