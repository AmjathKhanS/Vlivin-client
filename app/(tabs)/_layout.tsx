import { Tabs } from 'expo-router';
import { TabBar } from '@/components/TabBar';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: '#FFF6F1' } } as any}>
      <Tabs.Screen name="us" />
      <Tabs.Screen name="play" />
      <Tabs.Screen name="talk" />
      <Tabs.Screen name="moi" />
    </Tabs>
  );
}
