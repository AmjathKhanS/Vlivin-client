import React from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { api } from '@/lib/api';
import { realtime } from '@/lib/ws';
import { Reveal } from '@/components/Reveal';
import { Counter } from '@/components/Counter';
import { PressableScale } from '@/components/PressableScale';
import { colors, font } from '@/theme';

function Avatar({ name, bg, fg, offset = 0 }: { name: string; bg: string; fg: string; offset?: number }) {
  return (
    <View style={[s.avatar, { backgroundColor: bg, marginLeft: offset }]}>
      <Text style={[s.avatarText, { color: fg }]}>{name.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}

function LiveDot({ on }: { on: boolean }) {
  const o = useSharedValue(1);
  React.useEffect(() => {
    // Presence pulse: only while the partner is actually online.
    if (on) o.value = withRepeat(withSequence(withTiming(0.35, { duration: 900 }), withTiming(1, { duration: 900 })), -1);
    else o.value = 0.3;
  }, [on]);
  const a = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[s.live, { backgroundColor: on ? colors.live : colors.track }, a]} />;
}

export default function Us() {
  const { top } = useSafeAreaInsets();
  const qc = useQueryClient();
  const { data: couple, refetch, isRefetching } = useQuery({ queryKey: ['couple'], queryFn: api.couple });

  // Keep the screen fresh when the partner does something.
  React.useEffect(() => {
    const offs = ['presence', 'widget.refresh', 'mood.updated', 'location.updated'].map((t) => realtime.on(t, () => qc.invalidateQueries({ queryKey: ['couple'] })));
    return () => offs.forEach((f) => f());
  }, [qc]);

  return (
    <ScrollView
      contentContainerStyle={{ paddingTop: top + 12, paddingHorizontal: 20, paddingBottom: 32, gap: 16 }}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={colors.primary} />}
    >
      <Reveal i={0}><Text style={s.title}>Us</Text></Reveal>
      {couple ? (
        <>
          <Reveal i={1}>
            <View style={s.coupleCard}>
              <View style={{ flexDirection: 'row' }}>
                <Avatar name={couple.me.name} bg="#fff" fg={colors.primaryText} />
                <Avatar name={couple.partner.name} bg={colors.dark} fg="#fff" offset={-14} />
              </View>
              <Text style={s.dayLabel}>Day</Text>
              <Counter value={couple.dayCount ?? 0} style={s.day} />
              <Text style={s.meta}>
                {couple.distanceKm != null ? `${couple.distanceKm.toLocaleString()} km apart` : 'Share locations to see distance'}
                {couple.daysToGo != null ? ` · ${couple.daysToGo} days to go` : ''}
              </Text>
              <View style={s.clocks}>
                <View style={s.clock}><Text style={s.clockLabel}>{couple.me.name}</Text><Text style={s.clockTime}>{couple.me.localTime}</Text></View>
                <View style={s.clock}><Text style={s.clockLabel}>{couple.partner.name}</Text><Text style={s.clockTime}>{couple.partner.localTime}</Text></View>
              </View>
            </View>
          </Reveal>
          <Reveal i={2}>
            <View style={s.row}>
              <LiveDot on={couple.partner.online} />
              <Text style={s.rowText}>{couple.partner.name} is {couple.partner.online ? 'online' : 'away'}</Text>
              <PressableScale style={s.hug}><Text style={s.hugText}>Send a hug</Text></PressableScale>
            </View>
          </Reveal>
        </>
      ) : null}
    </ScrollView>
  );
}
const s = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 34, color: colors.ink, letterSpacing: -0.5 },
  coupleCard: { backgroundColor: colors.pink, borderRadius: 28, padding: 22, gap: 4 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: colors.pink },
  avatarText: { fontFamily: font.display, fontSize: 18 },
  dayLabel: { fontFamily: font.bodySemi, fontSize: 13, color: colors.primaryText, marginTop: 14 },
  day: { fontFamily: font.display, fontSize: 30, color: colors.ink, height: 40 },
  meta: { fontFamily: font.bodyMed, fontSize: 13, color: colors.secondary },
  clocks: { flexDirection: 'row', gap: 10, marginTop: 14 },
  clock: { flex: 1, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 16, padding: 12 },
  clockLabel: { fontFamily: font.bodyMed, fontSize: 12, color: colors.muted },
  clockTime: { fontFamily: font.display, fontSize: 20, color: colors.ink },
  row: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 22, padding: 16 },
  rowText: { flex: 1, fontFamily: font.bodySemi, fontSize: 14, color: colors.ink },
  live: { width: 10, height: 10, borderRadius: 5 },
  hug: { backgroundColor: colors.pink, paddingHorizontal: 14, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  hugText: { fontFamily: font.bodyBold, fontSize: 13, color: colors.primaryText },
});
