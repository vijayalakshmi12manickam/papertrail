import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, Pressable, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import TextField from '../../components/common/TextField';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';

export default function LoginScreen({ navigation }) {
  const { theme } = useAppTheme();
  const { signIn, resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [resetVisible, setResetVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) {
      setError('Enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email.trim(), password);
    } catch (e) {
      setError(mapAuthError(e.code));
    } finally {
      setLoading(false);
    }
  };

  const openResetModal = () => {
    setResetEmail(email);
    setResetError('');
    setResetVisible(true);
  };

  const handleResetPassword = async () => {
    setResetError('');
    if (!resetEmail.trim()) {
      setResetError('Enter your email address.');
      return;
    }
    setResetLoading(true);
    try {
      await resetPassword(resetEmail.trim());
      setResetVisible(false);
      Alert.alert('Check your email', `A password reset link has been sent to ${resetEmail.trim()}.`);
    } catch (e) {
      setResetError(mapResetError(e.code));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={[styles.container, { padding: theme.spacing.lg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
          <Ionicons
            name="wallet"
            size={30}
            color={theme.colors.accent}
            style={{ marginRight: 10 }}
          />
          <Text style={[theme.typography.h1, { color: theme.colors.textPrimary }]}>PaperTrail</Text>
        </View>
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, marginBottom: theme.spacing.xl },
          ]}
        >
          Track spending, splits, and budgets.
        </Text>

        <TextField
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={{ marginBottom: theme.spacing.md }}
        />
        <TextField
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={{ marginBottom: theme.spacing.sm }}
        />

        <Pressable onPress={openResetModal} style={{ alignSelf: 'flex-end', marginBottom: theme.spacing.md }}>
          <Text style={[theme.typography.caption, { color: theme.colors.accent }]}>Forgot Password?</Text>
        </Pressable>

        {error ? (
          <Text
            style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: theme.spacing.sm }]}
          >
            {error}
          </Text>
        ) : null}

        <Button title="Log In" onPress={handleLogin} loading={loading} style={{ marginTop: theme.spacing.sm }} />

        <Pressable onPress={() => navigation.navigate('Signup')} style={{ marginTop: theme.spacing.lg }}>
          <Text style={[theme.typography.body, { color: theme.colors.accent, textAlign: 'center' }]}>
            No account? Create one
          </Text>
        </Pressable>
      </View>

      <Modal visible={resetVisible} onClose={() => setResetVisible(false)} title="Reset Password">
        <View style={{ padding: theme.spacing.md }}>
          <Text
            style={[theme.typography.body, { color: theme.colors.textSecondary, marginBottom: theme.spacing.md }]}
          >
            Enter your account email and we'll send you a link to reset your password.
          </Text>
          <TextField
            label="Email"
            value={resetEmail}
            onChangeText={setResetEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            error={resetError}
            style={{ marginBottom: theme.spacing.md }}
          />
          <Button
            title="Send Reset Email"
            onPress={handleResetPassword}
            loading={resetLoading}
            style={{ marginBottom: theme.spacing.sm }}
          />
          <Button title="Cancel" variant="outline" onPress={() => setResetVisible(false)} />
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

function mapAuthError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again shortly.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

function mapResetError(code) {
  switch (code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/user-not-found':
      return 'No account found with that email.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again shortly.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
});
