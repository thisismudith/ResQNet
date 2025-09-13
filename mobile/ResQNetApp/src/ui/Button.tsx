import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent, ViewStyle } from 'react-native';

type Props = {
  title: string;
  onPress: (e: GestureResponderEvent) => void;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: ViewStyle;
  disabled?: boolean;
};

export default function Button({ title, onPress, variant = 'primary', style, disabled }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.base, styles[variant], disabled && styles.disabled, style]}
    >
      <Text style={styles.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, alignItems: 'center' },
  primary: { backgroundColor: '#111827' },
  secondary: { backgroundColor: '#6b7280' },
  danger: { backgroundColor: '#ef4444' }, // red
  disabled: { opacity: 0.6 },
  text: { color: '#fff', fontWeight: '600' },
});
