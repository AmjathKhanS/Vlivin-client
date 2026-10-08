import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { colors, font } from '@/theme';

export default function Name() {
  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  const save = async () => {
    setBusy(true); setErr('');
    try {
      await api.updateMe({ name: name.trim(), city: city.trim() || null, tz });
      await useAuth.getState().refresh();
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ gap: 10, marginTop: 24, marginBottom: 24 }}>
          <Reveal i={0}><Text style={s.title}>What should your person call you?</Text></Reveal>
          <Reveal i={1}><Text style={s.sub}>Your city and time zone let you see each other's local time.</Text></Reveal>
        </View>
        <Reveal i={2} style={{ gap: 12 }}>
          <TextInput value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.track} style={s.input} autoFocus />
          <TextInput value={city} onChangeText={setCity} placeholder="Your city" placeholderTextColor={colors.track} style={s.input} />
          {err ? <Text style={s.err}>{err}</Text> : null}
        </Reveal>
        <Reveal i={3} style={{ marginTop: 'auto' }}>
          <Button title="Continue" onPress={save} loading={busy} disabled={!name.trim()} />
        </Reveal>
      </KeyboardAvoidingView>
    </Screen>
  );
}
const s = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 30, color: colors.ink, letterSpacing: -0.5 },
  sub: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: colors.muted },
  input: { height: 56, borderRadius: 18, backgroundColor: '#fff', paddingHorizontal: 18, fontFamily: font.bodySemi, fontSize: 17, color: colors.ink, borderWidth: 2, borderColor: colors.outline },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: colors.primaryText },
});
