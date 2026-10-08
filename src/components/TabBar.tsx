import React from 'react';
import { View, Text, Platform, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs';
import * as Haptics from 'expo-haptics';
import { PressableScale } from './PressableScale';
import { colors, font, springs } from '@/theme';

const ICONS: Record<string, { name: keyof typeof MaterialIcons.glyphMap; label: string }> = {
  us: { name: 'favorite', label: 'Us' },
  play: { name: 'sports-esports', label: 'Play' },
  talk: { name: 'forum', label: 'Talk' },
  moi: { name: 'auto-awesome', label: 'Moi' },
};

function Item({ focused, route, onPress }: { focused: boolean; route: string; onPress: () => void }) {
  const p = useSharedValue(focused ? 1 : 0);
  const lift = useSharedValue(0);
  React.useEffect(() => {
    p.value = withSpring(focused ? 1 : 0, springs.soft);
    if (focused) { lift.value = -7; lift.value = withSpring(0, springs.bouncy); }
  }, [focused]);
  const icon = useAnimatedStyle(() => ({ transform: [{ translateY: lift.value }, { scale: 1 + p.value * 0.12 }] }));
  const pill = useAnimatedStyle(() => ({ opacity: p.value, transform: [{ scaleX: 0.4 + p.value * 0.6 }] }));
  const meta = ICONS[route];
  const android = Platform.OS === 'android';
  return (
    <PressableScale onPress={onPress} scaleTo={0.9} haptic={false} style={s.item}>
      <View style={s.iconWrap}>
        {android ? <Animated.View style={[s.pill, pill]} /> : null}
        <Animated.View style={icon}>
          <MaterialIcons name={meta.name} size={android ? 24 : 26} color={focused ? (android ? colors.primaryText : colors.primary) : colors.muted} />
        </Animated.View>
      </View>
      <Text style={[s.label, { fontSize: android ? 12 : 10, color: focused ? colors.ink : colors.muted, fontFamily: focused ? font.bodyBold : font.bodyMed }]}>{meta.label}</Text>
    </PressableScale>
  );
}

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const { bottom } = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(bottom, 8) }]}>
      {state.routes.map((r, i) => (
        <Item
          key={r.key} route={r.name} focused={state.index === i}
          onPress={() => {
            const e = navigation.emit({ type: 'tabPress', target: r.key, canPreventDefault: true });
            if (state.index !== i && !e.defaultPrevented) { Haptics.selectionAsync(); navigation.navigate(r.name); }
          }}
        />
      ))}
    </View>
  );
}
const s = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.96)', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.outline, paddingTop: 8 },
  item: { flex: 1, alignItems: 'center', gap: 2 },
  iconWrap: { width: 60, height: 32, alignItems: 'center', justifyContent: 'center' },
  pill: { position: 'absolute', width: 60, height: 32, borderRadius: 16, backgroundColor: '#FFE3EA' },
  label: {},
});
