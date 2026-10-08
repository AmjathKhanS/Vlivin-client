import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Screen } from './Screen';
import { Reveal } from './Reveal';
import { colors, font } from '@/theme';

export function Placeholder({ title, stage }: { title: string; stage: string }) {
  return (
    <Screen>
      <Reveal><Text style={s.title}>{title}</Text></Reveal>
      <Reveal i={1}><View style={s.card}><Text style={s.text}>Coming in {stage}</Text></View></Reveal>
    </Screen>
  );
}
const s = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 34, color: colors.ink, marginTop: 8, marginBottom: 16 },
  card: { backgroundColor: '#fff', borderRadius: 22, padding: 24 },
  text: { fontFamily: font.bodySemi, color: colors.muted },
});
