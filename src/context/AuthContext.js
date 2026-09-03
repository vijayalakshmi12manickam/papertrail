import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from 'firebase/auth';
import { setDoc, getDoc } from 'firebase/firestore';
import { auth } from '../../firebase/config';
import { userDoc } from '../../firebase/collections';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (initializing) setInitializing(false);
    });
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signUp = async (email, password) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const ref = userDoc(cred.user.uid);
    const existing = await getDoc(ref);
    if (!existing.exists()) {
      // One-time profile doc write on account creation — not a recurring cost.
      await setDoc(ref, {
        displayName: email.split('@')[0],
        email,
        baseCurrency: 'GBP',
        themePreference: 'system',
      });
    }
    return cred.user;
  };

  const signIn = (email, password) => signInWithEmailAndPassword(auth, email, password);

  const signOut = () => firebaseSignOut(auth);

  return (
    <AuthContext.Provider value={{ user, initializing, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
