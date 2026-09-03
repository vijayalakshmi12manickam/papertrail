import React from 'react';
import { Modal as RNModal, View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../../context/ThemeContext';

export default function Modal({ visible, onClose, title, children, footer }) {
  const { theme } = useAppTheme();

  return (
    <RNModal visible={visible} animationType="slide" onRequestClose={onClose} presentationStyle="pageSheet">
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <View
          style={[
            styles.header,
            { borderBottomColor: theme.colors.border, paddingHorizontal: theme.spacing.md },
          ]}
        >
          <Text style={[theme.typography.h3, { color: theme.colors.textPrimary }]}>{title}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Text style={[theme.typography.body, { color: theme.colors.accent }]}>Close</Text>
          </Pressable>
        </View>
        <View style={{ flex: 1 }}>{children}</View>
        {footer ? (
          <View style={[styles.footer, { borderTopColor: theme.colors.border, padding: theme.spacing.md }]}>
            {footer}
          </View>
        ) : null}
      </SafeAreaView>
    </RNModal>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
