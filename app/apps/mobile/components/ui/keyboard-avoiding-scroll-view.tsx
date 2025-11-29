import { KeyboardAvoidingView, Platform, ScrollView, type ScrollViewProps } from 'react-native';
import * as React from 'react';

interface KeyboardAvoidingScrollViewProps extends ScrollViewProps {
  children: React.ReactNode;
}

export function KeyboardAvoidingScrollView({
  children,
  contentContainerStyle,
  ...props
}: KeyboardAvoidingScrollViewProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView
        contentContainerStyle={contentContainerStyle}
        keyboardShouldPersistTaps="handled"
        {...props}
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
