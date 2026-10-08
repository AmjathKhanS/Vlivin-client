import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { PressableScale } from './PressableScale';
import { colors, font } from '@/theme';

export function BackHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const router = useRouter();
  return (
    <View style={{ gap: 10, marginBottom: 20 }}>
      <PressableScale onPress={() => router.back()} style={s.back}>
        <MaterialIcons name="arrow-back" size={22} color={colors.ink} />
      </PressableScale>
      <Text style={s.title}>{title}</Text>
      {subtitle ? <Text style={s.sub}>{subtitle}</Text> : null}
    </View>
  );
}
const s = StyleSheet.create({
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontFamily: font.display, fontSize: 30, color: colors.ink, letterSpacing: -0.5 },
  sub: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: colors.muted },
});
