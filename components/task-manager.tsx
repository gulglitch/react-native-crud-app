import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import Todo from '../components/todo';

interface TodoItem {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
}

export default function TaskManager() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingTodo, setEditingTodo] = useState<{ id: string; title: string } | null>(null);
  const [editingText, setEditingText] = useState('');

  // Fetch todos from Supabase
  const fetchTodos = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) setTodos(data);
    }

    setLoading(false);
  };

  // Delete a task
  const handleDeleteTodo = async (id: string) => {
    const { error } = await supabase.from('todos').delete().eq('id', id);
    if (!error) fetchTodos();
  };

  // Mark as complete/incomplete
  const handleToggleComplete = async (id: string, completed: boolean) => {
    const { error } = await supabase.from('todos').update({ completed: !completed }).eq('id', id);
    if (!error) fetchTodos();
  };

  // Start editing a task
  const handleEditTodo = (todo: TodoItem) => {
    setEditingTodo({ id: todo.id, title: todo.title });
    setEditingText(todo.title);
  };

  // Update the task title
  const handleUpdateTodo = async () => {
    if (!editingTodo || !editingText.trim()) return;

    setLoading(true);
    const { error } = await supabase
      .from('todos')
      .update({ title: editingText })
      .eq('id', editingTodo.id);

    if (!error) {
      await fetchTodos();
      setEditingTodo(null);
      setEditingText('');
    }

    setLoading(false);
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
    setEditingText('');
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <View style={styles.container}>

      {/* Task input section */}
      <View style={styles.section}>
        <View style={styles.headerWithIcon}>
          <Ionicons name="create-outline" size={20} color="#4DB8FF" style={styles.headerIcon} />
          <Text style={styles.sectionHeader}>Enter a task</Text>
        </View>
        <Todo fetchTodos={fetchTodos} editingTodo={null} setEditingTodo={() => {}} />
      </View>

      {/* Task list section */}
      <View style={styles.section}>
        <View style={styles.headerWithIcon}>
          <Ionicons name="list-outline" size={20} color="#4DB8FF" style={styles.headerIcon} />
          <Text style={styles.sectionHeader}>Your tasks</Text>
        </View>

        {loading && !todos.length ? (
          <Text style={styles.loadingText}>Loading todos...</Text>
        ) : (
          <FlatList
            data={todos}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContainer}
            ListEmptyComponent={<Text style={styles.emptyText}>No tasks yet. Add one above!</Text>}
            renderItem={({ item }) => (
              <View style={[
                styles.todoItem,
                item.completed && styles.completedItem
              ]}>

                {/* Checkbox */}
                <TouchableOpacity
                  onPress={() => handleToggleComplete(item.id, item.completed)}
                  style={styles.checkboxContainer}
                >
                  <View style={[
                    styles.checkbox,
                    item.completed && styles.checkboxCompleted
                  ]}>
                    {item.completed && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                  </View>
                </TouchableOpacity>

                {/* If editing this task */}
                {editingTodo?.id === item.id ? (
                  <View style={styles.editContainer}>
                    <TextInput
                      style={styles.editInput}
                      value={editingText}
                      onChangeText={setEditingText}
                      autoFocus
                      onSubmitEditing={handleUpdateTodo}
                    />
                    <View style={styles.editActions}>
                      <TouchableOpacity onPress={handleUpdateTodo}>
                        <Ionicons name="checkmark" size={20} color="#4CD964" />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={handleCancelEdit}>
                        <Ionicons name="close" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.todoText,
                      item.completed && styles.completedTodo
                    ]}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>
                )}

                {/* Edit & Delete actions */}
                <View style={styles.actions}>
                  {!item.completed && editingTodo?.id !== item.id && (
                    <TouchableOpacity onPress={() => handleEditTodo(item)} style={styles.actionButton}>
                      <Ionicons name="create-outline" size={20} color="#A0A0A0" />
                    </TouchableOpacity>
                  )}
                  {editingTodo?.id !== item.id && (
                    <TouchableOpacity onPress={() => handleDeleteTodo(item.id)} style={styles.actionButton}>
                      <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  )}
                </View>

              </View>
            )}
          />
        )}
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E2D',
    padding: 15,
  },
  section: {
    marginBottom: 20,
  },
  headerWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  headerIcon: {
    marginRight: 8,
  },
  sectionHeader: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingBottom: 20,
  },
  todoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E3145',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  completedItem: {
    opacity: 0.8,
    backgroundColor: '#2E314590',
  },
  checkboxContainer: {
    padding: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#4CD964',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  checkboxCompleted: {
    backgroundColor: '#4CD964',
  },
  todoText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  completedTodo: {
    textDecorationLine: 'line-through',
    color: '#A0A0A0',
  },
  editContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    backgroundColor: '#3A3E5B',
    borderRadius: 6,
    padding: 8,
    marginRight: 10,
  },
  editActions: {
    flexDirection: 'row',
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  actionButton: {
    marginLeft: 15,
  },
  loadingText: {
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    color: '#A0A0A0',
    textAlign: 'center',
    marginTop: 20,
  },
});