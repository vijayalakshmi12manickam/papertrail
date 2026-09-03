import React, { useState } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../context/ThemeContext';
import { useCurrencies } from '../../hooks/useCurrencies';
import TextField from '../common/TextField';
import Select from '../common/Select';
import Button from '../common/Button';

const DIRECTIONS = [
  { label: 'They paid me', value: 'theyPaidMe' },
  { label: 'I paid them', value: 'iPaidThem' },
];

export default function SettlementForm({ initialPersonName, initialDirection, initialAmount, initialCurrency, onSubmit, onCancel, submitting }) {
  const { theme } = useAppTheme();
  const { data: currencies = [] } = useCurrencies();

  const [personName, setPersonName] = useState(initialPersonName || '');
  const [direction, setDirection] = useState(initialDirection || 'theyPaidMe');
  const [amount, setAmount] = useState(initialAmount != null ? String(initialAmount) : '');
  const [currency, setCurrency] = useState(initialCurrency || 'GBP');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!personName.trim()) errs.personName = 'Required';
    if (!amount || parseFloat(amount) <= 0) errs.amount = 'Enter an amount greater than 0';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      personName: personName.trim(),
      direction,
      amount: parseFloat(amount),
      currency,
      date,
      note: note.trim(),
    });
  };

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} keyboardShouldPersistTaps="handled">
      <TextField
        label="Person"
        value={personName}
        onChangeText={setPersonName}
        placeholder="e.g. Daniel"
        error={errors.personName}
        style={{ marginBottom: theme.spacing.md }}
      />

      <Select
        label="Direction"
        options={DIRECTIONS}
        value={direction}
        onChange={setDirection}
        style={{ marginBottom: theme.spacing.md }}
      />

      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
          <TextField
            label="Amount"
            value={amount}
            onChangeText={setAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            error={errors.amount}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            label="Currency"
            options={currencies.map((c) => ({ label: c.name, value: c.name }))}
            value={currency}
            onChange={setCurrency}
          />
        </View>
      </View>

      <View style={{ marginBottom: theme.spacing.md }}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>Date</Text>
        <Button title={date.toDateString()} variant="outline" onPress={() => setShowDatePicker(true)} />
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display={Platform.OS === 'ios' ? 'inline' : 'default'}
            onChange={(e, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setDate(selected);
            }}
          />
        )}
      </View>

      <TextField
        label="Note (optional)"
        value={note}
        onChangeText={setNote}
        placeholder="e.g. Venmo transfer"
        style={{ marginBottom: theme.spacing.md }}
      />

      <Button title="Log Settlement" onPress={handleSubmit} loading={submitting} style={{ marginBottom: theme.spacing.sm }} />
      <Button title="Cancel" variant="outline" onPress={onCancel} />
    </ScrollView>
  );
}
