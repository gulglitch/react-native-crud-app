import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, SafeAreaView } from 'react-native';
import { Auth } from '../components/auth';
import TaskManager from '../components/task-manager';
import { supabase } from '../lib/supabase';
import { Session } from '@supabase/supabase-js';

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [authKey, setAuthKey] = useState(0); 

  // Fetch initial session
  const fetchSession = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session ?? null);
    } catch (error) {
      console.error('Error fetching session:', error);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  // Listen to auth changes
  useEffect(() => {
    fetchSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
    });

    return () => subscription?.unsubscribe();
  }, []);

  // Log out
  const handleLogout = async () => {
    try {
      setLogoutLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setAuthKey(prev => prev + 1); // 🧼 force reset <Auth />
    } catch (error) {
      console.error('Error logging out:', error);
    } finally {
      setLogoutLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4DB8FF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {session ? (
          <>
            <View style={styles.header}>
              <Text style={styles.headerText}>NoteDown</Text>
            </View>
            <TaskManager />
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={logoutLoading}
            >
              {logoutLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.logoutText}>Log Out</Text>
              )}
            </TouchableOpacity>
          </>
        ) : (
          <Auth key={authKey} />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1C2C',
  },
  container: {
    flex: 1,
    backgroundColor: '#1A1C2C',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1C2C',
  },
  header: {
    padding: 16,
    backgroundColor: '#2E3145',
    borderBottomWidth: 1,
    borderBottomColor: '#4DB8FF',
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  logoutButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default App;
