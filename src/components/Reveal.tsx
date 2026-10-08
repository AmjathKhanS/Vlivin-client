import React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { ViewStyle, StyleProp } from 'react-native';

/** Staggered entrance. Use <Reveal i={0}>, <Reveal i={1}> … */
export function Reveal({ i = 0, children, style }: { i?: number; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Animated.View entering={FadeInDown.delay(i * 70).springify().damping(16).stiffness(140)} style={style}>{children}</Animated.View>;
}
