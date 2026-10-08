import React from 'react';
import { ActivityIndicator, Text, StyleSheet, type ViewStyle } from 'react-native';
import { PressableScale } from './PressableScale';
import { colors, font } from '@/theme';

type Variant = 'primary' | 'dark' | 'light' | 'ghost';
const bg: Record<Variant, string> = { primary: colors.primary, dark: '#23161F', light: colors.white, ghost: 'transparent' };
const fg: Record<Variant, string> = { primary: '#fff', dark: '#fff', light: colors.ink, ghost: colors.primaryText };

export function Button({ title, onPress, variant = 'primary', loading, disabled, style }:
  { title: string; onPress?: () => void; variant?: Variant; loading?: boolean; disabled?: boolean; style?: ViewStyle }) {
  return (
    <PressableScale
      onPress={onPress}
      disabled={disabled || loading}
      style={[s.base, { backgroundColor: bg[variant], opacity: disabled ? 0.45 : 1 }, style]}
    >
      {loading ? <ActivityIndicator color={fg[variant]} /> : <Text style={[s.text, { color: fg[variant] }]}>{title}</Text>}
    </PressableScale>
  );
}
const s = StyleSheet.create({
  base: { height: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  text: { fontFamily: font.bodyBold, fontSize: 16 },
});
