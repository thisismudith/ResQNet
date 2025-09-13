import React from 'react';
import { TextInput, StyleSheet, TextInputProps } from 'react-native';

export default function TextField(props: TextInputProps) {
  return <TextInput {...props} style={[styles.input, props.style]} />;
}

const styles = StyleSheet.create({
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 10, padding: 12 },
});
