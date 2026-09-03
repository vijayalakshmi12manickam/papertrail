import React, { useEffect, useState } from 'react';
import { View, Text, Switch, Alert } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAppLock } from '../../context/AppLockContext';

export default function BiometricLockToggle() {
  const { theme } = useAppTheme();
  const { enabled, enableLock, disableLock, checkDeviceSupport } = useAppLock();
  const [supported, setSupported] = useState(true);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    checkDeviceSupport()
      .then(({ supported: ok }) => setSupported(ok))
      .catch((e) => {
        console.warn('AppLock: device support check failed, treating as unsupported', e);
        setSupported(false);
      })
      .finally(() => setChecking(false));
  }, [checkDeviceSupport]);

  const handleToggle = async (next) => {
    setBusy(true);
    try {
      if (next) {
        const { success, reason } = await enableLock();
        if (!success && reason === 'unsupported') {
          Alert.alert(
            'Not available',
            'This device has no Face ID, fingerprint, or other biometric login set up. Set one up in your device settings first.'
          );
        } else if (!success) {
          Alert.alert('Could not enable', 'Verification failed or was cancelled.');
        }
      } else {
        await disableLock();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <View style={{ flex: 1, marginRight: theme.spacing.md }}>
        <Text style={[theme.typography.bodyStrong, { color: theme.colors.textPrimary }]}>
          Face ID / Fingerprint Unlock
        </Text>
        <Text style={[theme.typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
          {checking
            ? 'Checking device support…'
            : supported
            ? 'Require biometric verification when reopening the app.'
            : 'Not available — set up Face ID or a fingerprint in your device settings.'}
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={handleToggle}
        disabled={checking || busy || (!supported && !enabled)}
        trackColor={{ true: theme.colors.accent }}
      />
    </View>
  );
}
