import React from "react";
import { Tabs, router } from "expo-router";
import { BottomTabBar } from "@/components/BottomTabBar";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: "none" }, // Hide default tab bar
      }}
      tabBar={({ state }) => {
        // Map route index to our custom tab bar names
        // Route names in app/(tabs) are: index, chat, explore, likes, profile
        const routeName = state.routes[state.index].name;
        const currentTab = routeName === "index" ? "home" : routeName;

        const handleTabPress = (tabName: string) => {
          if (tabName === "home") {
            router.replace("/(tabs)");
          } else {
            router.replace(`/(tabs)/${tabName}` as any);
          }
        };

        return <BottomTabBar currentTab={currentTab} onTabPress={handleTabPress} />;
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="chat" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="likes" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
