import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/theme';

export function Screen({ children, style, dark }: { children: React.ReactNode; style?: ViewStyle; dark?: boolean }) {
  const { top, bottom } = useSafeAreaInsets();
  return (
    <View style={[s.root, { paddingTop: top + 8, paddingBottom: bottom + 12, backgroundColor: dark ? colors.deep : colors.bg }, style]}>
      {children}
    </View>
  );
}
const s = StyleSheet.create({ root: { flex: 1, paddingHorizontal: 20 } });
