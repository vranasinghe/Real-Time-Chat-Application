import React from "react";
import { View, Pressable, StyleSheet } from "react-native";
import { Home, MessageSquare, Compass, Heart, User } from "lucide-react-native";

interface CustomTabBarProps {
  currentTab: string;
  onTabPress: (tab: string) => void;
}

const TABS = [
  { name: "home", Icon: Home },
  { name: "chat", Icon: MessageSquare },
  { name: "explore", Icon: Compass },
  { name: "likes", Icon: Heart },
  { name: "profile", Icon: User },
];

export function BottomTabBar({ currentTab, onTabPress }: CustomTabBarProps) {
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const isActive = currentTab === tab.name;
        return (
          <Pressable
            key={tab.name}
            onPress={() => onTabPress(tab.name)}
            style={styles.tabBtn}
          >
            <View
              style={[
                styles.iconWrap,
                isActive && styles.iconWrapActive,
              ]}
            >
              <tab.Icon
                size={20}
                color={isActive ? "#7C5CFF" : "#9A8FB8"}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    height: 68,
    backgroundColor: "rgba(27,16,53,0.97)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 20,
    elevation: 16,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  iconWrapActive: {
    backgroundColor: "rgba(124,92,255,0.15)",
  },
});
