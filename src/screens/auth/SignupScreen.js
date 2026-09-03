import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import TextField from '../../components/common/TextField';
import Button from '../../components/common/Button';
import BrandHeader from '../../components/common/BrandHeader';

export default function SignupScreen({ navigation }) {
  const { theme } = useAppTheme();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError('');
    if (!email || !password) {
      setError('Enter an email and password.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password);
    } catch (e) {
      setError(mapAuthError(e.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={[styles.container, { padding: theme.spacing.lg }]}>
        <BrandHeader size={28} textStyle={theme.typography.h1} />
        <Text
          style={[
            theme.typography.body,
            { color: theme.colors.textSecondary, marginTop: 4, marginBottom: theme.spacing.xl },
          ]}
        >
          Create your account
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
          style={{ marginBottom: theme.spacing.md }}
        />
        <TextField
          label="Confirm password"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          style={{ marginBottom: theme.spacing.md }}
        />

        {error ? (
          <Text
            style={[theme.typography.caption, { color: theme.colors.danger, marginBottom: theme.spacing.sm }]}
          >
            {error}
          </Text>
        ) : null}

        <Button title="Create Account" onPress={handleSignup} loading={loading} style={{ marginTop: theme.spacing.sm }} />

        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: theme.spacing.lg }}>
          <Text style={[theme.typography.body, { color: theme.colors.accent, textAlign: 'center' }]}>
            Already have an account? Log in
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function mapAuthError(code) {
  switch (code) {
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/weak-password':
      return 'Password is too weak.';
    default:
      return 'Something went wrong. Please try again.';
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
});
