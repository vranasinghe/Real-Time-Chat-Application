import React from "react";
import { View, Text } from "react-native";
import { Image as ImageIcon } from "lucide-react-native";

interface ImagePlaceholderProps {
  aspectRatio?: number;
  width?: string | number;
}

export function ImagePlaceholder({ aspectRatio = 4 / 5, width = "100%" }: ImagePlaceholderProps) {
  return (
    <View
      style={{ aspectRatio }}
      className="bg-bg-surface border border-text-secondary/15 rounded-3xl items-center justify-center p-6 w-full"
    >
      <View className="bg-bg-base w-16 h-16 rounded-full items-center justify-center mb-3 border border-text-secondary/10">
        <ImageIcon size={28} color="#9A8FB8" />
      </View>
      <Text className="text-text-secondary font-sans font-medium text-[14px] text-center">
        No Image Preview
      </Text>
    </View>
  );
}
