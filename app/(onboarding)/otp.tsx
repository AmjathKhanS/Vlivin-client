import React, { useEffect, useState } from 'react';
import { Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Screen } from '@/components/Screen';
import { BackHeader } from '@/components/Header';
import { CodeInput } from '@/components/CodeInput';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { colors, font } from '@/theme';

export default function Otp() {
  const { phone, devCode } = useLocalSearchParams<{ phone: string; devCode?: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const verify = async (c: string) => {
    setBusy(true); setErr('');
    try {
      const r = await api.verifyOtp(phone, c);
      await useAuth.getState().signIn(r.token, r.isNew); // Gate routes onward
    } catch (e: any) { setErr(e.message); setCode(''); } finally { setBusy(false); }
  };
  useEffect(() => { if (code.length === 6) verify(code); }, [code]);

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <BackHeader title="Enter the code" subtitle={`Sent to ${phone}`} />
        <Reveal i={1}>
          <CodeInput value={code} onChange={setCode} numeric error={!!err} />
          {err ? <Text style={s.err}>{err}</Text> : null}
          {devCode ? (
            // Staging only: the test server returns the code in the response.
            <Text onPress={() => setCode(devCode)} style={s.dev}>Test server code: {devCode} (tap to fill)</Text>
          ) : null}
        </Reveal>
        <Reveal i={2} style={{ marginTop: 'auto' }}>
          <Button title="Verify" onPress={() => verify(code)} loading={busy} disabled={code.length !== 6} />
        </Reveal>
      </KeyboardAvoidingView>
    </Screen>
  );
}
const s = StyleSheet.create({
  err: { marginTop: 12, fontFamily: font.bodyMed, fontSize: 13, color: colors.primaryText },
  dev: { marginTop: 16, fontFamily: font.bodySemi, fontSize: 13, color: colors.lilacText, textAlign: 'center' },
});
