import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

// Props expected by the Todo component
interface TodoProps {
  fetchTodos: () => Promise<void>;
  editingTodo: { id: string; title: string } | null;
  setEditingTodo: (todo: { id: string; title: string } | null) => void;
}

export default function Todo({ fetchTodos, editingTodo, setEditingTodo }: TodoProps) {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  // Load current todo title when editing starts
  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title);
    } else {
      setTitle('');
    }
  }, [editingTodo]);

  const handleSaveTodo = async () => {
    if (!title.trim()) return;

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (editingTodo) {
      // Update existing todo
      const { error } = await supabase
        .from('todos')
        .update({ title })
        .eq('id', editingTodo.id);

      if (!error) {
        resetForm();
        await fetchTodos();
      }
    } else {
      // Add new todo
      const { error } = await supabase
        .from('todos')
        .insert([{ title, completed: false, user_id: user?.id }]);

      if (!error) {
        resetForm();
        await fetchTodos();
      }
    }

    setLoading(false);
  };

  const resetForm = () => {
    setTitle('');
    setEditingTodo(null);
  };

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter a task"
        placeholderTextColor="#A0A0A0"
        value={title}
        onChangeText={setTitle}
      />

      {editingTodo ? (
        // Buttons shown when editing a todo
        <View style={styles.buttonGroup}>
          <TouchableOpacity onPress={resetForm} style={styles.iconButton}>
            <Ionicons name="close" size={24} color="#FF3B30" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleSaveTodo}
            disabled={!title.trim() || loading}
            style={[styles.iconButton, (!title.trim() || loading) && styles.disabled]}
          >
            <Ionicons name="checkmark" size={24} color="#4CD964" />
          </TouchableOpacity>
        </View>
      ) : (
        // Button shown when adding a new todo
        <TouchableOpacity
          onPress={handleSaveTodo}
          disabled={!title.trim() || loading}
          style={[styles.iconButton, (!title.trim() || loading) && styles.disabled]}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3145',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    paddingVertical: 8,
  },
  iconButton: {
    marginLeft: 10,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#4A5064',
  },
  buttonGroup: {
    flexDirection: 'row',
  },
  disabled: {
    opacity: 0.5,
  },
});
