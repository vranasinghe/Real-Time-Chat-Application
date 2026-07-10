import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Ruler, Plus, Minus } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PrimaryButton, GhostButton } from "@/components/PrimaryButton";

export default function HeightSetupScreen() {
  const [height, setHeight] = useState(175); // default height in cm

  const handleNext = () => {
    useAppStore.setState((state) => {
      if (state.user) {
        return { user: { ...state.user, height_cm: height } };
      }
      return {};
    });
    router.push("/profile-setup/photos");
  };

  const increment = () => {
    if (height < 230) setHeight((prev) => prev + 1);
  };

  const decrement = () => {
    if (height > 120) setHeight((prev) => prev - 1);
  };

  // Helper to convert cm to feet/inches
  const cmToFtIn = (cm: number) => {
    const inchesTotal = cm / 2.54;
    const feet = Math.floor(inchesTotal / 12);
    const inches = Math.round(inchesTotal % 12);
    return `${feet}'${inches}"`;
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 justify-between px-6 py-6">
        
        {/* Header */}
        <View className="w-full">
          <View className="mt-8 mb-10">
            <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
              How tall are you?
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              Height helps complete your profile details. You can change this later in settings.
            </Text>
          </View>
        </View>

        {/* Incremental Height Picker */}
        <View className="flex-1 justify-center items-center">
          
          <View className="flex-row items-center justify-center space-x-8 mb-6">
            
            {/* Decrement Button */}
            <Pressable
              onPress={decrement}
              className="w-14 h-14 rounded-2xl bg-bg-surface border border-white/5 items-center justify-center active:bg-white/5"
            >
              <Minus size={22} color="#FFFFFF" />
            </Pressable>

            {/* Display */}
            <View className="items-center">
              <Text className="text-white text-6xl font-bold font-display tracking-tight">
                {height}
                <Text className="text-primary text-2xl font-sans font-bold">cm</Text>
              </Text>
              <Text className="text-text-secondary text-lg font-sans mt-2">
                {cmToFtIn(height)}
              </Text>
            </View>

            {/* Increment Button */}
            <Pressable
              onPress={increment}
              className="w-14 h-14 rounded-2xl bg-bg-surface border border-white/5 items-center justify-center active:bg-white/5"
            >
              <Plus size={22} color="#FFFFFF" />
            </Pressable>

          </View>

          {/* Graphic Icon */}
          <View className="flex-row items-center space-x-2 bg-bg-surface border border-white/5 px-4 py-2.5 rounded-full">
            <Ruler size={16} color="#7C5CFF" />
            <Text className="text-text-secondary font-sans text-[13px]">
              Average height selected
            </Text>
          </View>

        </View>

        {/* Actions */}
        <View className="w-full space-y-3.5 pb-4">
          <PrimaryButton
            label="Next"
            onPress={handleNext}
          />
          <GhostButton
            label="Skip"
            onPress={() => router.push("/profile-setup/photos")}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}
