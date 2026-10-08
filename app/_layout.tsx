import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Slot, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts, BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque';
import { PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans';
import { useAuth } from '@/store/auth';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();
const qc = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 15_000 } } });

function Gate() {
  const status = useAuth((s) => s.status);
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => { useAuth.getState().boot(); }, []);

  useEffect(() => {
    if (status === 'booting') return;
    const group = segments[0];
    const target =
      status === 'ready' ? '/(tabs)/us'
      : status === 'needsProfile' ? '/(onboarding)/name'
      : status === 'needsPairing' ? '/(onboarding)/pair'
      : '/(onboarding)/welcome';
    const inRightPlace =
      (status === 'ready' && group === '(tabs)') ||
      (status === 'signedOut' && group === '(onboarding)' && segments[1] !== 'pair' && segments[1] !== 'name') ||
      (status === 'needsProfile' && segments[1] === 'name') ||
      (status === 'needsPairing' && segments[1] === 'pair');
    if (!inRightPlace) router.replace(target as any);
  }, [status, segments]);

  return <Slot />;
}

export default function Root() {
  const [loaded] = useFonts({
    BricolageGrotesque_600SemiBold, BricolageGrotesque_700Bold, BricolageGrotesque_800ExtraBold,
    PlusJakartaSans_400Regular, PlusJakartaSans_500Medium, PlusJakartaSans_600SemiBold, PlusJakartaSans_700Bold,
  });
  useEffect(() => { if (loaded) SplashScreen.hideAsync(); }, [loaded]);
  if (!loaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={qc}>
          <StatusBar style="dark" />
          <Gate />
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
