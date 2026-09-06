import React, { useState } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../../context/ThemeContext';
import TextField from '../../common/TextField';
import Select from '../../common/Select';
import Button from '../../common/Button';

const TYPE_OPTIONS = [
  { label: 'Expense', value: 'expense' },
  { label: 'Income', value: 'income' },
];

const TXN_TYPE_OPTIONS = [
  { label: 'Card', value: 'card' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Other', value: 'other' },
];

// Edits a single parsed row before import — deliberately a smaller form than
// the full ExpenseForm (no splits/participants): imports land as plain
// expenses first, shared-expense conversion happens afterward via the normal
// Edit Expense flow.
export default function ImportRowEditModal({ transaction, categories, onSave, onCancel, onExclude }) {
  const { theme } = useAppTheme();
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [date, setDate] = useState(transaction.date);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [type, setType] = useState(transaction.type);
  const [txnType, setTxnType] = useState(transaction.txnType);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id, icon: c.icon }));

  const handleSave = () => {
    const parsedAmount = parseFloat(amount);
    onSave({
      ...transaction,
      description: description.trim() || transaction.description,
      amount: Number.isFinite(parsedAmount) ? Math.abs(parsedAmount) : transaction.amount,
      date,
      type,
      txnType,
      categoryId: type === 'income' ? null : categoryId,
      selected: true,
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} keyboardShouldPersistTaps="handled">
      <TextField
        label="Description"
        value={description}
        onChangeText={setDescription}
        style={{ marginBottom: theme.spacing.md }}
      />

      <TextField
        label="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        style={{ marginBottom: theme.spacing.md }}
      />

      <View style={{ marginBottom: theme.spacing.md }}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>Date</Text>
        <Button title={date.toDateString()} variant="outline" onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(event, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setDate(selected);
            }}
          />
        )}
      </View>

      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
          <Select label="Type" options={TYPE_OPTIONS} value={type} onChange={setType} />
        </View>
        <View style={{ flex: 1 }}>
          <Select label="Method" options={TXN_TYPE_OPTIONS} value={txnType} onChange={setTxnType} />
        </View>
      </View>

      {type === 'expense' ? (
        <Select
          label="Category"
          options={categoryOptions}
          value={categoryId}
          onChange={setCategoryId}
          style={{ marginBottom: theme.spacing.md }}
        />
      ) : null}

      {transaction.possibleSelfTransfer ? (
        <Text style={[theme.typography.caption, { color: theme.colors.warning, marginBottom: theme.spacing.md }]}>
          Flagged: {transaction.selfTransferReason}
        </Text>
      ) : null}
      {transaction.isDuplicate ? (
        <Text style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: theme.spacing.md }]}>
          This looks like it might already be in your expenses.
        </Text>
      ) : null}

      <Button title="Save Changes" onPress={handleSave} style={{ marginBottom: theme.spacing.sm }} />
      <Button
        title="Exclude from Import"
        variant="outline"
        onPress={() => onExclude(transaction.localId)}
        style={{ marginBottom: theme.spacing.sm }}
      />
      <Button title="Cancel" variant="outline" onPress={onCancel} />
    </ScrollView>
  );
}
