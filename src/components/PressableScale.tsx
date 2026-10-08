import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { springs } from '@/theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>; scaleTo?: number; haptic?: boolean;
};

/** Every tappable thing in the app: springy press-in, haptic tick. */
export function PressableScale({ style, scaleTo = 0.95, haptic = true, onPressIn, onPressOut, onPress, ...rest }: Props) {
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <AnimatedPressable
      {...rest}
      style={[style, a]}
      onPressIn={(e) => { s.value = withSpring(scaleTo, springs.press); onPressIn?.(e); }}
      onPressOut={(e) => { s.value = withSpring(1, springs.bouncy); onPressOut?.(e); }}
      onPress={(e) => { if (haptic) Haptics.selectionAsync(); onPress?.(e); }}
    />
  );
}
