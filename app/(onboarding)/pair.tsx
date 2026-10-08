import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Share, Alert } from 'react-native';
import Animated, { FadeIn, FadeInDown, ZoomIn } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { CodeInput } from '@/components/CodeInput';
import { PressableScale } from '@/components/PressableScale';
import { api, type Pairing } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { colors, font } from '@/theme';

export default function Pair() {
  const [mode, setMode] = useState<'invite' | 'join'>('invite');
  const [code, setCode] = useState('');
  const [pending, setPending] = useState<Extract<Pairing, { state: 'pending' }> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const me = useAuth((s) => s.me);

  const makeCode = useCallback(async () => {
    setBusy(true);
    try {
      const r = await api.pairingCode();
      const st = await api.pairingStatus();
      if (st.state === 'pending') setPending(st); else setPending({ state: 'pending', code: r.code, expiresAt: r.expiresAt, hoursLeft: 24 });
    } catch (e: any) { setErr(e.message); } finally { setBusy(false); }
  }, []);

  useEffect(() => {
    if (me?.pairing.state === 'pending') setPending(me.pairing); else makeCode();
  }, []);

  // Partner may join with our code at any time: poll until paired, then the Gate moves us on.
  useEffect(() => {
    const t = setInterval(async () => {
      try { const st = await api.pairingStatus(); if (st.state === 'paired') { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); useAuth.getState().refresh(); } } catch {}
    }, 4000);
    return () => clearInterval(t);
  }, []);

  const join = async (c: string) => {
    setBusy(true); setErr('');
    try { await api.pairingJoin(c); await useAuth.getState().refresh(); }
    catch (e: any) { setErr(e.message); setCode(''); } finally { setBusy(false); }
  };
  useEffect(() => { if (mode === 'join' && code.length === 6) join(code); }, [code]);

  return (
    <Screen>
      <Reveal i={0} style={{ marginTop: 16 }}>
        <Text style={s.title}>Invite your person</Text>
        <View style={s.seg}>
          {(['invite', 'join'] as const).map((m) => (
            <PressableScale key={m} onPress={() => { setMode(m); setErr(''); }} style={[s.segItem, mode === m && s.segOn]}>
              <Text style={[s.segText, mode === m && { color: colors.ink }]}>{m === 'invite' ? 'Share my code' : 'I have a code'}</Text>
            </PressableScale>
          ))}
        </View>
      </Reveal>

      {mode === 'invite' ? (
        <Animated.View key="invite" entering={FadeInDown.springify().damping(16)} style={{ flex: 1, gap: 16 }}>
          <View style={s.codeCard}>
            <Text style={s.codeLabel}>Your invite code</Text>
            <View style={{ flexDirection: 'row', gap: 4, justifyContent: 'center' }}>
              {(pending?.code ?? '······').split('').map((ch, i) => (
                <Animated.Text key={ch + i} entering={ZoomIn.delay(i * 60).springify().damping(10)} style={s.codeChar}>{ch}</Animated.Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', marginTop: 8 }}>
              <PressableScale style={s.chip} onPress={async () => { if (pending) { await Clipboard.setStringAsync(pending.code); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } }}>
                <Text style={s.chipText}>Copy</Text>
              </PressableScale>
              <PressableScale style={s.chip} onPress={makeCode}><Text style={s.chipText}>New code</Text></PressableScale>
            </View>
          </View>
          {pending ? (
            <Animated.View entering={FadeIn.delay(300)} style={s.banner}>
              <View style={s.dot} />
              <Text style={s.bannerText}>Waiting for your person to join · {pending.hoursLeft}h left</Text>
            </Animated.View>
          ) : null}
          <View style={{ marginTop: 'auto' }}>
            <Button
              title="Send invite" disabled={!pending}
              onPress={() => pending && Share.share({ message: `Join me on VLivIn! Use my invite code ${pending.code} (valid for 24h).` })}
            />
          </View>
        </Animated.View>
      ) : (
        <Animated.View key="join" entering={FadeInDown.springify().damping(16)} style={{ flex: 1, gap: 14, marginTop: 8 }}>
          <Text style={s.sub}>Enter the 6-character code your person shared with you.</Text>
          <CodeInput value={code} onChange={setCode} upper error={!!err} />
          {err ? <Text style={s.err}>{err}</Text> : null}
          <View style={{ marginTop: 'auto' }}><Button title="Pair up" loading={busy} disabled={code.length !== 6} onPress={() => join(code)} /></View>
        </Animated.View>
      )}
      <PressableScale style={{ alignSelf: 'center', padding: 12 }} onPress={() => Alert.alert('Sign out?', undefined, [{ text: 'Cancel' }, { text: 'Sign out', style: 'destructive', onPress: () => useAuth.getState().signOut() }])}>
        <Text style={s.out}>Sign out</Text>
      </PressableScale>
    </Screen>
  );
}
const s = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 30, color: colors.ink, letterSpacing: -0.5, marginBottom: 14 },
  sub: { fontFamily: font.body, fontSize: 15, lineHeight: 22, color: colors.muted },
  seg: { flexDirection: 'row', backgroundColor: colors.divider, borderRadius: 18, padding: 4, marginBottom: 18 },
  segItem: { flex: 1, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  segOn: { backgroundColor: '#fff' },
  segText: { fontFamily: font.bodyBold, fontSize: 13, color: colors.muted },
  codeCard: { backgroundColor: colors.lilac, borderRadius: 28, padding: 24, gap: 12 },
  codeLabel: { fontFamily: font.bodySemi, fontSize: 13, color: colors.lilacText, textAlign: 'center' },
  codeChar: { fontFamily: font.display, fontSize: 44, letterSpacing: 8, color: colors.lilacText },
  chip: { paddingHorizontal: 18, height: 38, borderRadius: 19, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  chipText: { fontFamily: font.bodyBold, fontSize: 13, color: colors.lilacText },
  banner: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.butter, borderRadius: 18, padding: 14 },
  bannerText: { fontFamily: font.bodySemi, fontSize: 13, color: colors.butterText, flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.butterText },
  err: { fontFamily: font.bodyMed, fontSize: 13, color: colors.primaryText },
  out: { fontFamily: font.bodySemi, fontSize: 13, color: colors.muted },
});
