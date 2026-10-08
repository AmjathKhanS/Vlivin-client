import React, { useEffect } from 'react';
import { View, Text, Platform, Alert, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, interpolate } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Screen } from '@/components/Screen';
import { Button } from '@/components/Button';
import { Reveal } from '@/components/Reveal';
import { PressableScale } from '@/components/PressableScale';
import { api } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { colors, font, springs } from '@/theme';

function FanCard({ w, h, rot, dx, color, delay, drag, depth, children }: any) {
  const p = useSharedValue(0);
  useEffect(() => { p.value = withDelay(delay, withSpring(1, springs.soft)); }, []);
  const a = useAnimatedStyle(() => ({
    opacity: p.value,
    transform: [
      { translateX: interpolate(p.value, [0, 1], [0, dx]) + drag.value * depth },
      { translateY: interpolate(p.value, [0, 1], [60, 0]) },
      { rotate: `${interpolate(p.value, [0, 1], [0, rot]) + drag.value * depth * 0.06}deg` },
      { scale: interpolate(p.value, [0, 1], [0.7, 1]) },
    ],
  }));
  return <Animated.View style={[s.card, { width: w, height: h, backgroundColor: color }, a]}>{children}</Animated.View>;
}

export default function Welcome() {
  const router = useRouter();
  const drag = useSharedValue(0);
  const pan = Gesture.Pan()
    .onUpdate((e) => { drag.value = e.translationX / 12; })
    .onEnd(() => { drag.value = withSpring(0, springs.bouncy); });

  const social = async () => {
    const provider = Platform.OS === 'ios' ? 'apple' : 'google';
    if (!__DEV__) return Alert.alert('Coming soon', `${provider === 'apple' ? 'Apple' : 'Google'} sign-in is added in a later stage. Use your phone number for now.`);
    // Dev only: the backend accepts dev:<sub>:<name> tokens outside production.
    try {
      const r = await api.social(provider, `dev:${provider}-demo:Demo`);
      await useAuth.getState().signIn(r.token, r.isNew);
    } catch (e: any) { Alert.alert('Sign-in failed', e.message); }
  };

  return (
    <Screen>
      <GestureDetector gesture={pan}>
        <View style={s.hero}>
          <FanCard w={146} h={190} rot={-8} dx={-92} depth={-1} drag={drag} color={colors.pink} delay={150}>
            <MaterialIcons name="favorite" size={44} color={colors.primary} />
          </FanCard>
          <FanCard w={146} h={190} rot={8} dx={92} depth={1} drag={drag} color={colors.lilac} delay={250}>
            <MaterialIcons name="draw" size={44} color={colors.lilacText} />
          </FanCard>
          <FanCard w={172} h={230} rot={0} dx={0} depth={0.4} drag={drag} color={colors.dark} delay={50}>
            <MaterialIcons name="videogame-asset" size={52} color="#fff" />
          </FanCard>
        </View>
      </GestureDetector>

      <View style={{ flex: 1, justifyContent: 'flex-end', gap: 14 }}>
        <Reveal i={3}><Text style={s.h1}>Far apart, still on the same couch.</Text></Reveal>
        <Reveal i={4}><Text style={s.body}>Moods, games, doodles and little everyday moments, together from anywhere.</Text></Reveal>
        <Reveal i={5} style={{ gap: 12, marginTop: 8 }}>
          <Button
            variant="dark" title={Platform.OS === 'ios' ? 'Continue with Apple' : 'Continue with Google'} onPress={social}
          />
          <Button title="Continue with phone number" onPress={() => router.push('/(onboarding)/phone')} />
          <PressableScale style={{ alignSelf: 'center', padding: 10 }} onPress={() => router.push('/(onboarding)/phone')}>
            <Text style={s.link}>I have an invite code</Text>
          </PressableScale>
        </Reveal>
      </View>
    </Screen>
  );
}
const s = StyleSheet.create({
  hero: { height: 300, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  card: { position: 'absolute', borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  h1: { fontFamily: font.display, fontSize: 38, lineHeight: 39, letterSpacing: -1, color: colors.ink },
  body: { fontFamily: font.body, fontSize: 16, lineHeight: 24, color: colors.muted },
  link: { fontFamily: font.bodyBold, fontSize: 15, color: colors.link },
});
