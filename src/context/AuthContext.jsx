import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { createUserProfile, subscribeUserProfile } from '../lib/db';
import { can } from '../lib/roles';

const AuthContext = createContext();

const AUTH_ERRORS = {
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/user-not-found': 'Incorrect email or password.',
  'auth/email-already-in-use': 'An account with this email already exists.',
  'auth/weak-password': 'Password must be at least 6 characters.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'Network error. Check your connection and try again.',
};

export function authErrorMessage(err) {
  return AUTH_ERRORS[err?.code] || 'Something went wrong. Please try again.';
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  // True while signup() is creating the profile itself, so the listener doesn't race it.
  const signingUp = useRef(false);

  useEffect(() => {
    let unsubscribeProfile = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribeProfile();
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      unsubscribeProfile = subscribeUserProfile(
        firebaseUser.uid,
        async (data) => {
          if (!data) {
            if (signingUp.current) return;
            // Profile missing (e.g. account created in the Firebase console) — create a customer profile.
            try {
              await createUserProfile(firebaseUser.uid, {
                name: firebaseUser.displayName || firebaseUser.email.split('@')[0],
                email: firebaseUser.email,
              });
            } catch (err) {
              console.error('Could not create user profile', err);
              setLoading(false);
            }
            return;
          }
          setProfile(data);
          setLoading(false);
        },
        (err) => {
          console.error('Could not load user profile', err);
          setProfile(null);
          setLoading(false);
        }
      );
    });
    return () => {
      unsubscribeProfile();
      unsubscribeAuth();
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
    return cred.user;
  }, []);

  const signup = useCallback(async ({ name, email, password }) => {
    signingUp.current = true;
    try {
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await createUserProfile(cred.user.uid, { name, email: cred.user.email });
      await updateProfile(cred.user, { displayName: name.trim() });
      return cred.user;
    } finally {
      signingUp.current = false;
    }
  }, []);

  const logout = useCallback(() => signOut(auth), []);

  const resetPassword = useCallback((email) => sendPasswordResetEmail(auth, email.trim()), []);

  const role = profile?.role || null;

  const value = {
    user,
    profile,
    role,
    loading,
    isAuthenticated: Boolean(user),
    isStaff: can.accessAdmin(role),
    login,
    signup,
    logout,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
