import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

// SecureStore keys are restricted to alphanumerics plus ".", "-", "_" (unlike
// the AsyncStorage keys used elsewhere in this app, which allow ":") — no colon.
const STORAGE_KEY = 'papertrail.biometricLockEnabled';

// Re-lock only if the app was backgrounded longer than this — a quick trip to
// the share sheet (CSV export), a permission dialog, or the date picker
// shouldn't force a fresh Face ID prompt the instant you come back.
const GRACE_PERIOD_MS = 60 * 1000;

const AppLockContext = createContext(null);

export function AppLockProvider({ children }) {
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [locked, setLocked] = useState(false);
  const backgroundedAt = useRef(null);
  const appState = useRef(AppState.currentState);

  useEffect(() => {
    // Race against a hard timeout: a failed or unexpectedly hanging native
    // call here must never leave the whole app stuck on the root loading
    // screen indefinitely — fail safe to "lock disabled" and let the user in.
    const timeout = new Promise((resolve) => setTimeout(() => resolve('timeout'), 3000));

    Promise.race([SecureStore.getItemAsync(STORAGE_KEY), timeout])
      .then((value) => {
        const isEnabled = value === 'true';
        setEnabled(isEnabled);
        setLocked(isEnabled); // every cold start with the lock on requires an unlock
      })
      .catch((e) => {
        console.warn('AppLock: failed to read lock preference, defaulting to disabled', e);
        setEnabled(false);
        setLocked(false);
      })
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      const prev = appState.current;
      appState.current = next;

      if (prev === 'active' && next !== 'active') {
        backgroundedAt.current = Date.now();
      } else if (prev !== 'active' && next === 'active') {
        if (enabled && backgroundedAt.current && Date.now() - backgroundedAt.current > GRACE_PERIOD_MS) {
          setLocked(true);
        }
        backgroundedAt.current = null;
      }
    });
    return () => sub.remove();
  }, [enabled]);

  const checkDeviceSupport = useCallback(async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolledDevice = await LocalAuthentication.isEnrolledAsync();
    return { hasHardware, isEnrolledDevice, supported: hasHardware && isEnrolledDevice };
  }, []);

  const promptBiometric = useCallback(async (promptMessage) => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: promptMessage || 'Unlock PaperTrail',
      disableDeviceFallback: false,
      cancelLabel: 'Cancel',
    });
    return result.success;
  }, []);

  // Confirms biometrics actually work on this device before persisting the
  // preference — better to fail here than silently lock the user out later.
  const enableLock = useCallback(async () => {
    const { supported } = await checkDeviceSupport();
    if (!supported) return { success: false, reason: 'unsupported' };

    const success = await promptBiometric('Confirm to enable app lock');
    if (success) {
      await SecureStore.setItemAsync(STORAGE_KEY, 'true');
      setEnabled(true);
      setLocked(false);
    }
    return { success };
  }, [checkDeviceSupport, promptBiometric]);

  const disableLock = useCallback(async () => {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    setEnabled(false);
    setLocked(false);
  }, []);

  const unlock = useCallback(async () => {
    const success = await promptBiometric('Unlock PaperTrail');
    if (success) setLocked(false);
    return success;
  }, [promptBiometric]);

  return (
    <AppLockContext.Provider
      value={{ enabled, loaded, locked, checkDeviceSupport, enableLock, disableLock, unlock }}
    >
      {children}
    </AppLockContext.Provider>
  );
}

export function useAppLock() {
  const ctx = useContext(AppLockContext);
  if (!ctx) throw new Error('useAppLock must be used within AppLockProvider');
  return ctx;
}
