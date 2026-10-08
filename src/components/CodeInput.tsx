import React, { useEffect, useRef } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, font, springs } from '@/theme';

function Box({ char, active, error }: { char: string; active: boolean; error: boolean }) {
  const pop = useSharedValue(1);
  useEffect(() => { if (char) { pop.value = withSequence(withTiming(1.14, { duration: 80 }), withSpring(1, springs.bouncy)); } }, [char]);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: pop.value }] }));
  return (
    <Animated.View style={[s.box, a, active && s.active, error && s.error]}>
      <Text style={s.char}>{char}</Text>
    </Animated.View>
  );
}

/** N-box code entry backed by one hidden input. Shakes on `error` change. */
export function CodeInput({ value, onChange, length = 6, error, upper, numeric, autoFocus = true }: {
  value: string; onChange: (v: string) => void; length?: number; error?: boolean; upper?: boolean; numeric?: boolean; autoFocus?: boolean;
}) {
  const ref = useRef<TextInput>(null);
  const x = useSharedValue(0);
  useEffect(() => {
    if (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      x.value = withSequence(withTiming(-10, { duration: 50 }), withTiming(10, { duration: 80 }), withTiming(-6, { duration: 70 }), withSpring(0, springs.press));
    }
  }, [error]);
  const shake = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Pressable onPress={() => ref.current?.focus()}>
      <Animated.View style={[s.row, shake]}>
        {Array.from({ length }).map((_, i) => (
          <Box key={i} char={value[i] ?? ''} active={i === Math.min(value.length, length - 1)} error={!!error} />
        ))}
      </Animated.View>
      <TextInput
        ref={ref} value={value} autoFocus={autoFocus} maxLength={length}
        keyboardType={numeric ? 'number-pad' : 'default'} autoCapitalize="characters" autoCorrect={false}
        textContentType="oneTimeCode" style={s.hidden}
        onChangeText={(t) => onChange(upper ? t.toUpperCase().replace(/[^A-Z0-9]/g, '') : t.replace(/\D/g, ''))}
      />
    </Pressable>
  );
}
const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 10, justifyContent: 'space-between' },
  box: { flex: 1, height: 52, borderRadius: 14, backgroundColor: '#fff', borderWidth: 2, borderColor: colors.outline, alignItems: 'center', justifyContent: 'center' },
  active: { borderColor: colors.primary },
  error: { borderColor: '#D42A55', backgroundColor: colors.pink },
  char: { fontFamily: font.display, fontSize: 24, color: colors.ink },
  hidden: { position: 'absolute', opacity: 0, height: 1, width: 1 },
});
