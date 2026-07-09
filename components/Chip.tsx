import React from "react";
import { Text, Pressable, PressableProps, View } from "react-native";

interface ChipProps extends PressableProps {
  label: string;
  active: boolean;
  icon?: React.ReactNode;
}

export function Chip({ label, active, icon, ...props }: ChipProps) {
  return (
    <Pressable
      className={`flex-row items-center justify-center rounded-full px-4 py-2 border mr-2 mb-2 ${
        active
          ? "bg-primary border-primary"
          : "bg-transparent border-text-secondary/20 active:bg-text-secondary/10"
      }`}
      {...props}
    >
      {icon && <View className="mr-1.5">{icon}</View>}
      <Text
        className={`font-sans text-[14px] font-medium ${
          active ? "text-white" : "text-text-secondary"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
