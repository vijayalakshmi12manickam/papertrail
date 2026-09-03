import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useAppLock } from '../../context/AppLockContext';
import BrandHeader from '../../components/common/BrandHeader';
import Button from '../../components/common/Button';

export default function LockScreen() {
  const { theme } = useAppTheme();
  const { signOut } = useAuth();
  const { unlock } = useAppLock();
  const [error, setError] = useState('');
  const [attempting, setAttempting] = useState(false);

  const handleUnlock = async () => {
    setError('');
    setAttempting(true);
    try {
      const success = await unlock();
      if (!success) setError('Verification failed or was cancelled.');
    } finally {
      setAttempting(false);
    }
  };

  // Prompt immediately on arrival so most opens are a single Face ID/fingerprint
  // check with no extra tap required.
  useEffect(() => {
    handleUnlock();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, padding: theme.spacing.lg }]}>
      <BrandHeader size={32} textStyle={theme.typography.h1} />
      <Text
        style={[
          theme.typography.body,
          { color: theme.colors.textSecondary, marginTop: theme.spacing.sm, marginBottom: theme.spacing.xl, textAlign: 'center' },
        ]}
      >
        Verify it's you to continue.
      </Text>

      {error ? (
        <Text
          style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: theme.spacing.md, textAlign: 'center' }]}
        >
          {error}
        </Text>
      ) : null}

      <Button title="Unlock" onPress={handleUnlock} loading={attempting} style={{ width: '100%', marginBottom: theme.spacing.sm }} />
      <Button title="Sign Out" variant="outline" onPress={signOut} style={{ width: '100%' }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
