import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useAppTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { useCategories } from '../../../hooks/useCategories';
import { useAccounts } from '../../../hooks/useAccounts';
import { useCurrencies } from '../../../hooks/useCurrencies';
import { useBulkImportExpenses } from '../../../hooks/useBulkImportExpenses';
import { fetchExpensesInRange } from '../../../hooks/useExpenses';
import {
  isPdfExtractionAvailable,
  pickStatementPdf,
  isStatementPasswordProtected,
  extractStatementText,
} from '../../../lib/statementImport/pdfSource';
import { parseStatementText } from '../../../lib/statementImport/parseStatementText';
import { enrichTransactions } from '../../../lib/statementImport/enrichTransactions';
import Modal from '../../common/Modal';
import Button from '../../common/Button';
import TextField from '../../common/TextField';
import ImportReviewStep from './ImportReviewStep';

// 'intro' -> 'picking' -> 'password'? -> 'review' -> 'done'
export default function ImportStatementModal({ visible, onClose }) {
  const { theme } = useAppTheme();
  const { user } = useAuth();
  const { data: categories = [] } = useCategories();
  const { data: accounts = [] } = useAccounts();
  const { data: currencies = [] } = useCurrencies();
  const bulkImport = useBulkImportExpenses();

  const [step, setStep] = useState('intro');
  const [error, setError] = useState('');
  const [pendingFile, setPendingFile] = useState(null);
  const [password, setPassword] = useState('');

  const [bank, setBank] = useState(null);
  const [rawText, setRawText] = useState('');
  const [transactions, setTransactions] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [unparsedLines, setUnparsedLines] = useState([]);
  const [accountId, setAccountId] = useState(null);
  const [currency, setCurrency] = useState('GBP');
  const [importedCount, setImportedCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleCopyRawText = async () => {
    await Clipboard.setStringAsync(rawText);
    setCopied(true);
  };

  useEffect(() => {
    if (visible) {
      setStep('intro');
      setError('');
      setPendingFile(null);
      setPassword('');
      setBank(null);
      setRawText('');
      setTransactions([]);
      setWarnings([]);
      setUnparsedLines([]);
      setAccountId(accounts[0]?.id || null);
      setCurrency('GBP');
      setCopied(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const runExtraction = async (uri, pwd) => {
    setStep('picking');
    setError('');
    try {
      const text = await extractStatementText(uri, pwd);
      setRawText(text);
      const parsed = parseStatementText(text);

      if (!parsed.bank) {
        setError(parsed.warnings[0] || 'Could not recognize this statement.');
        setStep('intro');
        return;
      }

      let existing = [];
      if (parsed.transactions.length > 0) {
        const times = parsed.transactions.map((t) => t.date.getTime());
        const minDate = new Date(Math.min(...times));
        const maxDate = new Date(Math.max(...times) + 24 * 60 * 60 * 1000);
        existing = await fetchExpensesInRange(user.uid, minDate, maxDate);
      }

      const enriched = enrichTransactions(parsed.transactions, {
        holderName: parsed.holderName,
        categories,
        existingExpenses: existing,
      });

      setBank(parsed.bank);
      setTransactions(enriched);
      setWarnings(parsed.warnings);
      setUnparsedLines(parsed.unparsedLines);
      setCurrency(parsed.currency);
      setStep('review');
    } catch (e) {
      if (e?.code === 'PASSWORD_REQUIRED' || e?.code === 'INCORRECT_PASSWORD') {
        setError(e.code === 'INCORRECT_PASSWORD' ? 'Incorrect password. Try again.' : 'This PDF is password protected.');
        setPendingFile({ uri });
        setStep('password');
      } else {
        setError(e?.message || 'Could not read this PDF.');
        setStep('intro');
      }
    }
  };

  const handlePick = async () => {
    setError('');
    const file = await pickStatementPdf();
    if (!file) return;

    setStep('picking');
    try {
      const needsPassword = await isStatementPasswordProtected(file.uri);
      if (needsPassword) {
        setPendingFile(file);
        setStep('password');
        return;
      }
      await runExtraction(file.uri);
    } catch (e) {
      setError(e?.message || 'Could not read this PDF.');
      setStep('intro');
    }
  };

  const handleUnlock = () => {
    if (!pendingFile) return;
    runExtraction(pendingFile.uri, password);
  };

  const handleImport = () => {
    const selected = transactions.filter((t) => t.selected);
    const expenses = selected.map((t) => ({
      item: t.description,
      date: t.date,
      categoryId: t.categoryId,
      accountId,
      txnType: t.txnType,
      currency,
      tags: [],
      type: t.type,
      amount: t.amount,
      isShared: false,
      paidBy: 'You',
      splitType: 'equal',
      totalAmount: 0,
      participants: [],
    }));

    bulkImport.mutate(expenses, {
      onSuccess: (result) => {
        setImportedCount(result.count);
        setStep('done');
      },
      onError: (e) => Alert.alert('Import failed', e?.message || 'Something went wrong.'),
    });
  };

  const pdfAvailable = isPdfExtractionAvailable();

  return (
    <Modal visible={visible} onClose={onClose} title="Import Bank Statement">
      {step === 'intro' && (
        <View style={{ padding: theme.spacing.md, flex: 1 }}>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
            Import a PDF bank statement to add its transactions as expenses. Currently supported: Monzo and
            Barclays.
          </Text>

          {!pdfAvailable ? (
            <Text style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: theme.spacing.md }]}>
              PDF import isn't available in this build (e.g. Expo Go) — it needs the full app build.
            </Text>
          ) : null}

          {error ? (
            <Text style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: theme.spacing.md }]}>
              {error}
            </Text>
          ) : null}

          {rawText ? (
            <Button
              title={copied ? 'Copied!' : 'Copy Raw Extracted Text (debug)'}
              variant="outline"
              onPress={handleCopyRawText}
              style={{ marginBottom: theme.spacing.sm }}
            />
          ) : null}

          <Button title="Choose PDF" onPress={handlePick} disabled={!pdfAvailable} style={{ marginBottom: theme.spacing.sm }} />
          <Button title="Cancel" variant="outline" onPress={onClose} />
        </View>
      )}

      {step === 'picking' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.accent} />
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginTop: theme.spacing.md }]}>
            Reading statement…
          </Text>
        </View>
      )}

      {step === 'password' && (
        <View style={{ padding: theme.spacing.md }}>
          <Text style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}>
            This PDF is password protected. Enter the password to continue.
          </Text>
          <TextField
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            error={error}
            style={{ marginBottom: theme.spacing.md }}
          />
          <Button title="Unlock" onPress={handleUnlock} style={{ marginBottom: theme.spacing.sm }} />
          <Button title="Cancel" variant="outline" onPress={onClose} />
        </View>
      )}

      {step === 'review' && (
        <ImportReviewStep
          bank={bank}
          transactions={transactions}
          setTransactions={setTransactions}
          warnings={warnings}
          unparsedLines={unparsedLines}
          categories={categories}
          accounts={accounts}
          currencies={currencies}
          accountId={accountId}
          setAccountId={setAccountId}
          currency={currency}
          setCurrency={setCurrency}
          onImport={handleImport}
          importing={bulkImport.isPending}
          onCancel={onClose}
          rawText={rawText}
          onCopyRawText={handleCopyRawText}
          copied={copied}
        />
      )}

      {step === 'done' && (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.lg }}>
          <Text style={[theme.typography.h2, { color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }]}>
            Done!
          </Text>
          <Text
            style={[
              theme.typography.body,
              { color: theme.colors.textSecondary, marginBottom: theme.spacing.lg, textAlign: 'center' },
            ]}
          >
            Imported {importedCount} transaction{importedCount === 1 ? '' : 's'}.
          </Text>
          <Button title="Close" onPress={onClose} style={{ width: '100%' }} />
        </View>
      )}
    </Modal>
  );
}
