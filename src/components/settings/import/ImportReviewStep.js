import React, { useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useAppTheme } from '../../../context/ThemeContext';
import Select from '../../common/Select';
import Button from '../../common/Button';
import Modal from '../../common/Modal';
import ImportTransactionRow from './ImportTransactionRow';
import ImportRowEditModal from './ImportRowEditModal';

export default function ImportReviewStep({
  bank,
  transactions,
  setTransactions,
  warnings,
  unparsedLines,
  categories,
  accounts,
  currencies,
  accountId,
  setAccountId,
  currency,
  setCurrency,
  onImport,
  importing,
  onCancel,
  rawText,
  onCopyRawText,
  copied,
}) {
  const { theme } = useAppTheme();
  const [editingId, setEditingId] = useState(null);

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accountOptions = accounts.map((a) => ({ label: a.name, value: a.id, icon: a.icon }));
  const currencyOptions = currencies.map((c) => ({ label: c.name, value: c.name }));

  const selectedCount = transactions.filter((t) => t.selected).length;
  const allSelected = transactions.length > 0 && selectedCount === transactions.length;

  const toggleOne = (localId) => {
    setTransactions((prev) => prev.map((t) => (t.localId === localId ? { ...t, selected: !t.selected } : t)));
  };

  const toggleAll = () => {
    setTransactions((prev) => prev.map((t) => ({ ...t, selected: !allSelected })));
  };

  const saveEdit = (updated) => {
    setTransactions((prev) => prev.map((t) => (t.localId === updated.localId ? updated : t)));
    setEditingId(null);
  };

  const excludeRow = (localId) => {
    setTransactions((prev) => prev.map((t) => (t.localId === localId ? { ...t, selected: false } : t)));
    setEditingId(null);
  };

  const editingTransaction = transactions.find((t) => t.localId === editingId);

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={transactions}
        keyExtractor={(item) => item.localId}
        contentContainerStyle={{ padding: theme.spacing.md, paddingBottom: 8 }}
        ListHeaderComponent={
          <View style={{ marginBottom: theme.spacing.md }}>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.sm }]}>
              Detected: {bank === 'monzo' ? 'Monzo' : 'Barclays'} · {transactions.length} transaction
              {transactions.length === 1 ? '' : 's'} found
            </Text>

            {warnings.map((w, i) => (
              <Text
                key={i}
                style={[theme.typography.caption, { color: theme.colors.warning, marginBottom: 6 }]}
              >
                ⚠ {w}
              </Text>
            ))}
            {unparsedLines.length > 0 ? (
              <Text style={[theme.typography.caption, { color: theme.colors.textMuted, marginBottom: theme.spacing.sm }]}>
                {unparsedLines.length} line{unparsedLines.length === 1 ? '' : 's'} couldn't be parsed and were
                skipped.
              </Text>
            ) : null}

            {(transactions.length === 0 || warnings.length > 0) && rawText ? (
              <Pressable onPress={onCopyRawText} style={{ marginBottom: theme.spacing.sm }}>
                <Text style={[theme.typography.caption, { color: theme.colors.accent }]}>
                  {copied ? 'Copied!' : 'Copy raw extracted text (debug)'}
                </Text>
              </Pressable>
            ) : null}

            <View style={{ flexDirection: 'row', marginBottom: theme.spacing.sm }}>
              <View style={{ flex: 1, marginRight: theme.spacing.sm }}>
                <Select label="Import into account" options={accountOptions} value={accountId} onChange={setAccountId} />
              </View>
              <View style={{ flex: 1 }}>
                <Select label="Currency" options={currencyOptions} value={currency} onChange={setCurrency} />
              </View>
            </View>

            <Pressable onPress={toggleAll} style={{ alignSelf: 'flex-start', marginBottom: 4 }}>
              <Text style={[theme.typography.caption, { color: theme.colors.accent }]}>
                {allSelected ? 'Deselect all' : 'Select all'}
              </Text>
            </Pressable>
            <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>
              {selectedCount} of {transactions.length} selected
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <ImportTransactionRow
            transaction={item}
            category={item.categoryId ? categoryById[item.categoryId] : null}
            currency={currency}
            onToggle={toggleOne}
            onEdit={(t) => setEditingId(t.localId)}
          />
        )}
        ListEmptyComponent={
          <Text style={[theme.typography.body, { color: theme.colors.textMuted }]}>
            No transactions were found in this statement.
          </Text>
        }
      />

      <View style={{ padding: theme.spacing.md, borderTopWidth: 1, borderTopColor: theme.colors.border }}>
        <Button
          title={`Import ${selectedCount} Transaction${selectedCount === 1 ? '' : 's'}`}
          onPress={onImport}
          loading={importing}
          disabled={!accountId || selectedCount === 0}
          style={{ marginBottom: theme.spacing.sm }}
        />
        <Button title="Cancel" variant="outline" onPress={onCancel} disabled={importing} />
      </View>

      <Modal visible={!!editingTransaction} onClose={() => setEditingId(null)} title="Edit Transaction">
        {editingTransaction ? (
          <ImportRowEditModal
            transaction={editingTransaction}
            categories={categories}
            onSave={saveEdit}
            onCancel={() => setEditingId(null)}
            onExclude={excludeRow}
          />
        ) : null}
      </Modal>
    </View>
  );
}
