import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Switch, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../context/ThemeContext';
import { useCategories } from '../../hooks/useCategories';
import { useAccounts } from '../../hooks/useAccounts';
import { useCurrencies } from '../../hooks/useCurrencies';
import { calculateSplit } from '../../lib/splitCalculators';
import { toJsDate } from '../../lib/format';
import TextField from '../common/TextField';
import Select from '../common/Select';
import Button from '../common/Button';
import ParticipantRow from './ParticipantRow';

const TXN_TYPES = [
  { label: 'Card', value: 'card' },
  { label: 'Cash', value: 'cash' },
  { label: 'Bank transfer', value: 'transfer' },
  { label: 'Other', value: 'other' },
];

const SPLIT_TYPES = [
  { label: 'Equal', value: 'equal' },
  { label: 'Percentage', value: 'percentage' },
  { label: 'Shares', value: 'shares' },
  { label: 'Custom amount', value: 'custom' },
];

export default function ExpenseForm({ initialExpense, onSubmit, onCancel, submitting }) {
  const { theme } = useAppTheme();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: currencies = [] } = useCurrencies();

  const isEdit = !!initialExpense;

  const [item, setItem] = useState(initialExpense?.item || '');
  const [date, setDate] = useState(toJsDate(initialExpense?.date) || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [categoryId, setCategoryId] = useState(initialExpense?.categoryId || null);
  const [accountId, setAccountId] = useState(initialExpense?.accountId || null);
  const [txnType, setTxnType] = useState(initialExpense?.txnType || 'card');
  const [currency, setCurrency] = useState(initialExpense?.currency || 'GBP');
  const [tagsInput, setTagsInput] = useState((initialExpense?.tags || []).join(', '));

  const [isShared, setIsShared] = useState(initialExpense?.isShared || false);
  const [amount, setAmount] = useState(initialExpense?.isShared ? '' : String(initialExpense?.amount ?? ''));
  const [totalAmount, setTotalAmount] = useState(
    initialExpense?.isShared ? String(initialExpense?.totalAmount ?? '') : ''
  );
  const [paidBy, setPaidBy] = useState(initialExpense?.paidBy || 'You');
  const [splitType, setSplitType] = useState(initialExpense?.splitType || 'equal');
  const [participants, setParticipants] = useState(
    initialExpense?.isShared && initialExpense?.participants?.length
      ? initialExpense.participants.map((p) => ({
          name: p.name,
          input: splitType === 'custom' ? String(p.amount) : String(p.share ?? ''),
        }))
      : [{ name: 'You', input: '' }]
  );

  const [errors, setErrors] = useState({});

  const split = useMemo(() => {
    if (!isShared) return null;
    return calculateSplit(splitType, parseFloat(totalAmount) || 0, participants, 'You');
  }, [isShared, splitType, totalAmount, participants]);

  const updateParticipant = (index, next) => {
    setParticipants((prev) => prev.map((p, i) => (i === index ? next : p)));
  };
  const addParticipant = () => setParticipants((prev) => [...prev, { name: '', input: '' }]);
  const removeParticipant = (index) => setParticipants((prev) => prev.filter((_, i) => i !== index));

  const validate = () => {
    const errs = {};
    if (!item.trim()) errs.item = 'Required';
    if (!categoryId) errs.categoryId = 'Required';
    if (!accountId) errs.accountId = 'Required';
    if (isShared) {
      if (!totalAmount || parseFloat(totalAmount) <= 0) errs.totalAmount = 'Enter the full receipt total';
      if (participants.some((p) => !p.name.trim())) errs.participants = 'Every participant needs a name';
      if (split && !split.isValid) errs.split = split.error;
    } else {
      if (!amount || parseFloat(amount) <= 0) errs.amount = 'Enter an amount greater than 0';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    const base = {
      item: item.trim(),
      date,
      categoryId,
      accountId,
      txnType,
      currency,
      tags,
    };

    if (isShared) {
      onSubmit({
        ...base,
        isShared: true,
        paidBy: paidBy.trim() || 'You',
        splitType,
        amount: split.myShare,
        totalAmount: parseFloat(totalAmount),
        participants: split.participants,
      });
    } else {
      onSubmit({
        ...base,
        isShared: false,
        paidBy: 'You',
        splitType: 'equal',
        amount: parseFloat(amount),
        totalAmount: 0,
        participants: [],
      });
    }
  };

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id, icon: c.icon }));
  const accountOptions = accounts.map((a) => ({ label: a.name, value: a.id, icon: a.icon }));
  const currencyOptions = currencies.map((c) => ({ label: c.name, value: c.name }));

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} keyboardShouldPersistTaps="handled">
      <TextField
        label="Item"
        value={item}
        onChangeText={setItem}
        placeholder="e.g. Ice Cave Tour"
        error={errors.item}
        style={{ marginBottom: theme.spacing.md }}
      />

      <View style={{ marginBottom: theme.spacing.md }}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
          Date
        </Text>
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
          <Select
            label="Category"
            options={categoryOptions}
            value={categoryId}
            onChange={setCategoryId}
            error={errors.categoryId}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select
            label="Account"
            options={accountOptions}
            value={accountId}
            onChange={setAccountId}
            error={errors.accountId}
          />
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
          <Select label="Type" options={TXN_TYPES} value={txnType} onChange={setTxnType} />
        </View>
        <View style={{ flex: 1 }}>
          <Select label="Currency" options={currencyOptions} value={currency} onChange={setCurrency} />
        </View>
      </View>

      <TextField
        label="Tags (comma separated)"
        value={tagsInput}
        onChangeText={setTagsInput}
        placeholder="e.g. Paris0226"
        style={{ marginBottom: theme.spacing.md }}
      />

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: theme.spacing.md,
        }}
      >
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]}>Shared expense</Text>
        <Switch value={isShared} onValueChange={setIsShared} trackColor={{ true: theme.colors.shared }} />
      </View>

      {!isShared ? (
        <TextField
          label="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          error={errors.amount}
          style={{ marginBottom: theme.spacing.md }}
        />
      ) : (
        <View style={{ marginBottom: theme.spacing.md }}>
          <TextField
            label="Total receipt amount"
            value={totalAmount}
            onChangeText={setTotalAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            error={errors.totalAmount}
            style={{ marginBottom: theme.spacing.md }}
          />
          <TextField
            label="Paid by"
            value={paidBy}
            onChangeText={setPaidBy}
            placeholder="You"
            style={{ marginBottom: theme.spacing.md }}
          />
          <Select
            label="Split type"
            options={SPLIT_TYPES}
            value={splitType}
            onChange={setSplitType}
            style={{ marginBottom: theme.spacing.sm }}
          />

          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 8 }]}>
            Participants
          </Text>
          {participants.map((p, i) => (
            <ParticipantRow
              key={i}
              participant={p}
              splitType={splitType}
              computedAmount={
                split?.isValid ? split.participants.find((sp) => sp.name === p.name)?.amount : null
              }
              onChange={(next) => updateParticipant(i, next)}
              onRemove={() => removeParticipant(i)}
              canRemove={participants.length > 1}
            />
          ))}
          <Button title="+ Add participant" variant="outline" onPress={addParticipant} style={{ marginBottom: theme.spacing.sm }} />

          {errors.participants ? (
            <Text style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: 8 }]}>
              {errors.participants}
            </Text>
          ) : null}
          {errors.split ? (
            <Text style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: 8 }]}>
              {errors.split}
            </Text>
          ) : null}
          {split?.isValid ? (
            <Text style={[theme.typography.caption, { color: theme.colors.success, marginBottom: 8 }]}>
              Your share: {split.myShare.toFixed(2)} {currency}
            </Text>
          ) : null}
        </View>
      )}

      <Button
        title={isEdit ? 'Save Changes' : 'Add Expense'}
        onPress={handleSubmit}
        loading={submitting}
        style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.sm }}
      />
      <Button title="Cancel" variant="outline" onPress={onCancel} />
    </ScrollView>
  );
}
