import React, { useState } from 'react';
import { View, Text, KeyboardAvoidingView, Platform, StyleSheet, Pressable } from 'react-native';
import { useAppTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import TextField from '../../components/common/TextField';
import Button from '../../components/common/Button';

export default function LoginScreen({ navigation }) {
  const { theme } = useAppTheme();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1, backgroundColor: theme.colors.background }}
    >
      <View style={[styles.container, { padding: theme.spacing.lg }]}>
        <Text style={[theme.typography.h1, { color: theme.colors.textPrimary, marginBottom: 4 }]}>
          PaperTrail
        </Text>
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
          style={{ marginBottom: theme.spacing.md }}
        />

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

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
});
