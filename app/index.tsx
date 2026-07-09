import React, { useEffect } from "react";
import { View, Text, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Heart } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function SplashScreen() {
  const { session, profileSetupComplete } = useAppStore();

  useEffect(() => {
    // Auto-login logic if session exists
    if (session) {
      if (profileSetupComplete) {
        router.replace("/(tabs)");
      } else {
        router.replace("/profile-setup/location");
      }
    }
  }, [session, profileSetupComplete]);
  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 justify-between items-center px-6 py-10">
        {/* Spacer */}
        <View />

        {/* Logo & Brand Section */}
        <View className="items-center justify-center">
          {/* Logo Frame */}
          <View className="w-24 h-24 rounded-3xl border border-white/20 items-center justify-center mb-6 bg-white/5">
            {/* Custom clover/heart design using Lucide Heart */}
            <View className="relative w-12 h-12 items-center justify-center">
              <Heart size={38} color="#FFFFFF" strokeWidth={1.5} />
              <View className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-primary" />
            </View>
          </View>

          {/* Brand Name */}
          <Text className="text-white text-4xl font-bold font-display tracking-tight mb-2">
            Dateza
          </Text>

          {/* Tagline */}
          <Text className="text-text-secondary text-base font-sans text-center px-8">
            Meaningful connections, made simple.
          </Text>
        </View>

        {/* Action Button */}
        <View className="w-full">
          <PrimaryButton
            label="Get Started"
            onPress={() => router.push("/onboarding")}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
