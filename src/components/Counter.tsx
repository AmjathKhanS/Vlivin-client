import React, { useEffect } from 'react';
import { TextInput, type TextStyle } from 'react-native';
import Animated, { useAnimatedProps, useSharedValue, withTiming, Easing } from 'react-native-reanimated';

const AnimatedInput = Animated.createAnimatedComponent(TextInput);

/** Rolls up from 0 to `value` on the UI thread. */
export function Counter({ value, style, prefix = '', duration = 1100 }: { value: number; style?: TextStyle; prefix?: string; duration?: number }) {
  const v = useSharedValue(0);
  useEffect(() => { v.value = withTiming(value, { duration, easing: Easing.out(Easing.cubic) }); }, [value]);
  const props = useAnimatedProps(() => ({ text: `${prefix}${Math.round(v.value)}`, defaultValue: `${prefix}0` } as any));
  return <AnimatedInput editable={false} pointerEvents="none" animatedProps={props} style={[{ padding: 0 }, style]} />;
}
