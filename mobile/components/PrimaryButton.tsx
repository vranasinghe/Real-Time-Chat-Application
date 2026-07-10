import React from "react";
import { Text, Pressable, PressableProps, ActivityIndicator, View } from "react-native";

interface ButtonProps extends PressableProps {
  label: string;
  loading?: boolean;
  icon?: React.ReactNode;
}

export function PrimaryButton({ label, loading, icon, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      className={`w-full bg-primary active:bg-primary-pressed rounded-[28px] py-4 px-6 items-center justify-center flex-row shadow-lg ${
        disabled ? "opacity-50" : "opacity-100"
      }`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className="text-white font-sans font-semibold text-[16px] text-center">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export function GhostButton({ label, loading, icon, disabled, ...props }: ButtonProps) {
  return (
    <Pressable
      disabled={disabled || loading}
      className={`w-full border border-primary active:bg-primary/10 rounded-[28px] py-4 px-6 items-center justify-center flex-row ${
        disabled ? "opacity-50" : "opacity-100"
      }`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color="#7C5CFF" size="small" />
      ) : (
        <View className="flex-row items-center justify-center">
          {icon && <View className="mr-2">{icon}</View>}
          <Text className="text-primary font-sans font-semibold text-[16px] text-center">
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
