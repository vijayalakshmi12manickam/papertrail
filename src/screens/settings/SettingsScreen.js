import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useCategories, useAddCategory, useDeleteCategory } from '../../hooks/useCategories';
import { useAccounts, useAddAccount, useDeleteAccount } from '../../hooks/useAccounts';
import { useSeedSampleData } from '../../hooks/useSeedSampleData';
import { fetchAllExpensesOnce } from '../../lib/fetchAllExpensesOnce';
import { exportExpensesAsCsv, exportExpensesAsXlsx } from '../../lib/exportFile';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import ThemeToggle from '../../components/settings/ThemeToggle';
import ManagedListSection from '../../components/settings/ManagedListSection';

export default function SettingsScreen() {
  const { theme } = useAppTheme();
  const { user, signOut } = useAuth();

  const { data: categories = [] } = useCategories();
  const addCategory = useAddCategory();
  const deleteCategory = useDeleteCategory();

  const { data: accounts = [] } = useAccounts();
  const addAccount = useAddAccount();
  const deleteAccount = useDeleteAccount();

  const [exporting, setExporting] = useState(null); // null | 'csv' | 'xlsx'
  const seedSampleData = useSeedSampleData();

  const categoryById = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c])), [categories]);
  const accountById = useMemo(() => Object.fromEntries(accounts.map((a) => [a.id, a])), [accounts]);

  const handleDeleteCategory = (id) => {
    Alert.alert('Delete category?', 'Existing expenses keep this category, but it will no longer appear as an option.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteCategory.mutate(id) },
    ]);
  };

  const handleDeleteAccount = (id) => {
    Alert.alert('Delete account?', 'Existing expenses keep this account, but it will no longer appear as an option.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAccount.mutate(id) },
    ]);
  };

  const handleExport = async (format) => {
    setExporting(format);
    try {
      const expenses = await fetchAllExpensesOnce(user.uid);
      if (expenses.length === 0) {
        Alert.alert('Nothing to export', 'You don\u2019t have any expenses logged yet.');
        return;
      }
      if (format === 'csv') {
        await exportExpensesAsCsv(expenses, categoryById, accountById);
      } else {
        await exportExpensesAsXlsx(expenses, categoryById, accountById);
      }
    } catch (e) {
      Alert.alert('Export failed', e.message || 'Something went wrong.');
    } finally {
      setExporting(null);
    }
  };

  const handleSignOut = () => {
    Alert.alert('Log out?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: () => signOut() },
    ]);
  };

  const handleSeedData = () => {
    Alert.alert(
      'Load sample data?',
      'Adds ~45 sample expenses, 2 budgets, and a settlement so you can see every screen populated. Safe to run on a test account; this does not remove anything existing.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Load Sample Data',
          onPress: () =>
            seedSampleData.mutate(undefined, {
              onSuccess: (result) =>
                Alert.alert(
                  'Sample data loaded',
                  `Added ${result.expenseCount} expenses, ${result.budgetCount} budgets, and ${result.settlementCount} settlement(s).`
                ),
              onError: (e) => Alert.alert('Failed to load sample data', e.message || 'Something went wrong.'),
            }),
        },
      ]
    );
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.colors.background }} contentContainerStyle={{ padding: theme.spacing.md }}>
      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary }]}>Signed in as</Text>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary, marginTop: 2, marginBottom: theme.spacing.md }]}>
          {user?.email}
        </Text>
        <Button title="Log Out" variant="outline" onPress={handleSignOut} />
      </Card>

      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
          Appearance
        </Text>
        <ThemeToggle />
      </Card>

      <Card style={{ marginBottom: theme.spacing.md }}>
        <ManagedListSection
          title="Categories"
          items={categories}
          onAdd={(data) => addCategory.mutate(data)}
          onDelete={handleDeleteCategory}
          adding={addCategory.isPending}
          namePlaceholder="e.g. Subscriptions"
        />
      </Card>

      <Card style={{ marginBottom: theme.spacing.md }}>
        <ManagedListSection
          title="Accounts / Banks"
          items={accounts}
          onAdd={(data) => addAccount.mutate(data)}
          onDelete={handleDeleteAccount}
          adding={addAccount.isPending}
          namePlaceholder="e.g. Monzo"
        />
      </Card>

      <Card style={{ marginBottom: theme.spacing.md }}>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 4 }]}>Developer</Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
          For testing — populates this account with realistic sample data across every tab.
        </Text>
        <Button title="Load Sample Data" variant="outline" onPress={handleSeedData} loading={seedSampleData.isPending} />
      </Card>

      <Card>
        <Text style={[theme.typography.h3, { color: theme.colors.textPrimary, marginBottom: 4 }]}>
          Export Data
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
          Exports your full expense history.
        </Text>
        <Button
          title="Export as CSV"
          onPress={() => handleExport('csv')}
          loading={exporting === 'csv'}
          disabled={!!exporting}
          style={{ marginBottom: theme.spacing.sm }}
        />
        <Button
          title="Export as Excel (.xlsx)"
          variant="outline"
          onPress={() => handleExport('xlsx')}
          loading={exporting === 'xlsx'}
          disabled={!!exporting}
        />
      </Card>
    </ScrollView>
  );
}
