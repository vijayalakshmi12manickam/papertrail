import React, { useState } from 'react';
import { View, Text, ScrollView, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppTheme } from '../../context/ThemeContext';
import { useCategories } from '../../hooks/useCategories';
import { getMonthRange } from '../../hooks/useExpenses';
import { toJsDate } from '../../lib/format';
import TextField from '../common/TextField';
import Select from '../common/Select';
import Button from '../common/Button';

const SCOPE_TYPES = [
  { label: 'Category', value: 'category' },
  { label: 'Tag', value: 'tag' },
];
const CURRENCIES = ['GBP', 'USD', 'EUR', 'ISK', 'JPY', 'AUD', 'CAD'].map((c) => ({ label: c, value: c }));

export default function BudgetForm({ initialBudget, onSubmit, onCancel, submitting }) {
  const { theme } = useAppTheme();
  const { data: categories = [] } = useCategories();
  const isEdit = !!initialBudget;

  const [scopeType, setScopeType] = useState(initialBudget?.scopeType || 'category');
  const [scopeValue, setScopeValue] = useState(initialBudget?.scopeValue || null);
  const [tagText, setTagText] = useState(scopeType === 'tag' ? initialBudget?.scopeValue || '' : '');
  const [periodStart, setPeriodStart] = useState(toJsDate(initialBudget?.periodStart) || new Date());
  const [periodEnd, setPeriodEnd] = useState(
    toJsDate(initialBudget?.periodEnd) || getMonthRange(new Date().getFullYear(), new Date().getMonth()).end
  );
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [totalBudget, setTotalBudget] = useState(String(initialBudget?.totalBudget ?? ''));
  const [currency, setCurrency] = useState(initialBudget?.currency || 'GBP');
  const [errors, setErrors] = useState({});

  const applyThisMonth = () => {
    const now = new Date();
    const { start, end } = getMonthRange(now.getFullYear(), now.getMonth());
    setPeriodStart(start);
    setPeriodEnd(end);
  };

  const validate = () => {
    const errs = {};
    if (scopeType === 'category' && !scopeValue) errs.scopeValue = 'Choose a category';
    if (scopeType === 'tag' && !tagText.trim()) errs.scopeValue = 'Enter a tag';
    if (!totalBudget || parseFloat(totalBudget) <= 0) errs.totalBudget = 'Enter an amount greater than 0';
    if (periodEnd <= periodStart) errs.periodEnd = 'End date must be after start date';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({
      scopeType,
      scopeValue: scopeType === 'category' ? scopeValue : tagText.trim(),
      periodStart,
      periodEnd,
      totalBudget: parseFloat(totalBudget),
      currency,
    });
  };

  const categoryOptions = categories.map((c) => ({ label: c.name, value: c.id, icon: c.icon }));

  return (
    <ScrollView contentContainerStyle={{ padding: theme.spacing.md }} keyboardShouldPersistTaps="handled">
      <Select
        label="Budget scope"
        options={SCOPE_TYPES}
        value={scopeType}
        onChange={setScopeType}
        style={{ marginBottom: theme.spacing.md }}
      />

      {scopeType === 'category' ? (
        <Select
          label="Category"
          options={categoryOptions}
          value={scopeValue}
          onChange={setScopeValue}
          error={errors.scopeValue}
          style={{ marginBottom: theme.spacing.md }}
        />
      ) : (
        <TextField
          label="Tag"
          value={tagText}
          onChangeText={setTagText}
          placeholder="e.g. Paris0226"
          error={errors.scopeValue}
          style={{ marginBottom: theme.spacing.md }}
        />
      )}

      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.sm }}>
        <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
            Start
          </Text>
          <Button title={periodStart.toDateString()} variant="outline" onPress={() => setShowStartPicker(true)} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
            End
          </Text>
          <Button title={periodEnd.toDateString()} variant="outline" onPress={() => setShowEndPicker(true)} />
        </View>
      </View>
      {errors.periodEnd ? (
        <Text style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: 8 }]}>
          {errors.periodEnd}
        </Text>
      ) : null}

      {showStartPicker && (
        <DateTimePicker
          value={periodStart}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, selected) => {
            setShowStartPicker(Platform.OS === 'ios');
            if (selected) setPeriodStart(selected);
          }}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={periodEnd}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onChange={(e, selected) => {
            setShowEndPicker(Platform.OS === 'ios');
            if (selected) setPeriodEnd(selected);
          }}
        />
      )}

      <Button
        title="Use this month"
        variant="outline"
        onPress={applyThisMonth}
        style={{ marginTop: theme.spacing.sm, marginBottom: theme.spacing.md }}
      />

      <View style={{ flexDirection: 'row', marginBottom: theme.spacing.md }}>
        <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
          <TextField
            label="Budget amount"
            value={totalBudget}
            onChangeText={setTotalBudget}
            keyboardType="decimal-pad"
            placeholder="0.00"
            error={errors.totalBudget}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Select label="Currency" options={CURRENCIES} value={currency} onChange={setCurrency} />
        </View>
      </View>

      <Button
        title={isEdit ? 'Save Changes' : 'Create Budget'}
        onPress={handleSubmit}
        loading={submitting}
        style={{ marginBottom: theme.spacing.sm }}
      />
      <Button title="Cancel" variant="outline" onPress={onCancel} />
    </ScrollView>
  );
}
