import React, { useState } from "react";
import { View, Text, TextInput, TextInputProps, Pressable } from "react-native";
import { Eye, EyeOff } from "lucide-react-native";

interface TextFieldProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
  rightIcon?: React.ReactNode;
}

export function TextField({
  label,
  error,
  isPassword = false,
  rightIcon,
  secureTextEntry,
  ...props
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(!isPassword);

  return (
    <View className="w-full mb-4">
      <Text className="text-text-secondary font-sans font-medium text-[14px] mb-2">
        {label}
      </Text>
      <View
        className={`w-full flex-row items-center bg-bg-surface rounded-2xl border ${
          error ? "border-like" : "border-text-secondary/10 focus:border-primary"
        } px-4 py-3.5`}
      >
        <TextInput
          placeholderTextColor="#9A8FB8"
          secureTextEntry={isPassword ? !showPassword : secureTextEntry}
          className="flex-1 text-white font-sans text-[16px] p-0"
          {...props}
        />
        {isPassword ? (
          <Pressable onPress={() => setShowPassword(!showPassword)} className="ml-2">
            {showPassword ? (
              <EyeOff size={20} color="#9A8FB8" />
            ) : (
              <Eye size={20} color="#9A8FB8" />
            )}
          </Pressable>
        ) : rightIcon ? (
          <View className="ml-2">{rightIcon}</View>
        ) : null}
      </View>
      {error ? (
        <Text className="text-like font-sans text-[12px] mt-1.5 ml-1">
          {error}
        </Text>
      ) : null}
    </View>
  );
}
