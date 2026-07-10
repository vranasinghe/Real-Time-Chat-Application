import React from "react";
import { View, Text } from "react-native";

interface BadgeProps {
  label: string;
  isOnline?: boolean;
  icon?: React.ReactNode;
}

export function Badge({ label, isOnline = false, icon }: BadgeProps) {
  return (
    <View className="flex-row items-center bg-white/15 border border-white/10 rounded-full px-3 py-1.5 self-start">
      {isOnline ? (
        <View className="w-2.5 h-2.5 rounded-full bg-online mr-2 animate-pulse" />
      ) : icon ? (
        <View className="mr-1.5">{icon}</View>
      ) : null}
      <Text className="text-white font-sans text-[13px] font-semibold tracking-wide">
        {label}
      </Text>
    </View>
  );
}
