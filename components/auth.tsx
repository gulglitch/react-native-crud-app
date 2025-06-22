import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Button 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export const Auth = () => {
  const [isLogin, setIsLogin] = useState(true); // Toggle between login/signup
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    setEmail('');
    setPassword('');
    setMessage(null);
    setIsLogin(true);
  }, []);

  const clearMessage = () => setMessage(null);

  const handleLoginOrSignup = async () => {
    setLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        setMessage({ text: 'Account created! Check your email to verify.', isError: false });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong';
      setMessage({ text: msg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setMessage({ text: 'Please enter your email first', isError: true });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      setMessage({ text: 'Password reset email sent!', isError: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Reset failed';
      setMessage({ text: msg, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Heading */}
      <View style={styles.headingContainer}>
        <Ionicons name="lock-closed-outline" size={24} color="#4DB8FF" style={styles.headingIcon} />
        <Text style={styles.heading}>Welcome to NoteDown</Text>
      </View>

      {/* Email Input */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Password Input */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#aaa"
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
      />

      {/* Buttons and Feedback */}
      {loading ? (
        <ActivityIndicator size="large" color="#4DB8FF" style={styles.loader} />
      ) : (
        <>
          <View style={styles.button}>
            <Button
              title={isLogin ? 'Login' : 'Sign Up'}
              onPress={handleLoginOrSignup}
              color="#4DB8FF"
            />
          </View>

          <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
            <Text style={styles.toggleText}>
              {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
            </Text>
          </TouchableOpacity>

          {isLogin && (
            <TouchableOpacity onPress={handlePasswordReset}>
              <Text style={styles.resetText}>Forgot password?</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Message Popup */}
      {message && (
        <View style={styles.popupOverlay}>
          <View style={styles.popupContainer}>
            <TouchableOpacity onPress={clearMessage} style={styles.closeButton}>
              <Ionicons name="close" size={20} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.popupText}>{message.text}</Text>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1C2C',
    justifyContent: 'center',
    padding: 24,
  },
  headingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  headingIcon: {
    marginRight: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E4E4E4',
  },
  input: {
    backgroundColor: '#2E3145',
    color: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
  },
  button: {
    marginVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
  },
  toggleText: {
    color: '#4DB8FF',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  resetText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 12,
    fontSize: 14,
  },
  loader: {
    marginTop: 20,
  },
  popupOverlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  popupContainer: {
    width: '80%',
    backgroundColor: '#1A1C2C',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
  },
  popupText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    marginTop: 10,
  },
});
