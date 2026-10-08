import React, { useState } from 'react';
import { TextInput, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BackHeader } from '@/components/Header';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { api } from '@/lib/api';
import { colors, font } from '@/theme';

export default function Phone() {
  const router = useRouter();
  const [phone, setPhone] = useState('+91');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const valid = /^\+[1-9]\d{7,14}$/.test(phone);

  const go = async () => {
    setBusy(true); setErr('');
    try {
      const r = await api.requestOtp(phone);
      router.push({ pathname: '/(onboarding)/otp', params: { phone, devCode: r.devCode ?? '' } });
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  };

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <BackHeader title="Your number" subtitle="We'll text you a 6-digit code. Include your country code." />
        <Reveal i={1}>
          <TextInput
            value={phone} onChangeText={(t) => setPhone('+' + t.replace(/\D/g, ''))}
            keyboardType="phone-pad" autoFocus style={s.input} placeholder="+91 98765 43210" placeholderTextColor={colors.track}
          />
          {err ? <Text style={s.err}>{err}</Text> : null}
        </Reveal>
        <Reveal i={2} style={{ marginTop: 'auto' }}>
          <Button title="Send code" onPress={go} loading={busy} disabled={!valid} />
        </Reveal>
      </KeyboardAvoidingView>
    </Screen>
  );
}
const s = StyleSheet.create({
  input: { height: 60, borderRadius: 18, backgroundColor: '#fff', paddingHorizontal: 18, fontFamily: font.bodyBold, fontSize: 22, color: colors.ink, borderWidth: 2, borderColor: colors.outline },
  err: { marginTop: 10, fontFamily: font.bodyMed, fontSize: 13, color: colors.primaryText },
});
