import React from "react";
import { View, Text, Image, ImageSourcePropType } from "react-native";
import { Image as ImageIcon } from "lucide-react-native";

interface ImagePlaceholderProps {
  aspectRatio?: number;
  width?: string | number;
  /** When provided, renders this image instead of the empty placeholder. */
  source?: ImageSourcePropType;
}

export function ImagePlaceholder({ aspectRatio = 4 / 5, width = "100%", source }: ImagePlaceholderProps) {
  if (source) {
    return (
      <View
        style={{ aspectRatio }}
        className="bg-bg-surface border border-white/10 rounded-3xl overflow-hidden w-full"
      >
        <Image source={source} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
      </View>
    );
  }

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
