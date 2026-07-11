import React, { useEffect } from "react";
import { View, Text, Image, Pressable, Dimensions } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/lib/store";

const { height } = Dimensions.get("window");

export default function SplashScreen() {
  const { session, profileSetupComplete } = useAppStore();

  useEffect(() => {
    // Auto-login logic if session exists
    if (session) {
      if (profileSetupComplete) {
        router.replace("/(tabs)");
      } else {
        router.replace("/profile-setup/birthday");
      }
    }
  }, [session, profileSetupComplete]);

  return (
    <View style={{ flex: 1, backgroundColor: "#1A0F3D" }}>
      <View className="flex-1 items-center justify-center px-8">
        {/* Logo & Brand Section */}
        <View className="items-center justify-center" style={{ marginTop: -height * 0.04 }}>
          <Image
            source={require("../assets/images/logo.png")}
            style={{ width: 300, height: 300, borderRadius: 60, overflow: "hidden" }}
            resizeMode="contain"
          />

          {/* Tagline */}
          <Text className="text-white/80 text-base font-sans text-center px-6 -mt-2">
            Meaningful connections, made simple.
          </Text>
        </View>

        {/* Centered Action Button */}
        <Pressable
          onPress={() => router.push("/onboarding")}
          className="bg-primary active:bg-primary-pressed rounded-full py-4 items-center justify-center shadow-lg mt-12"
          style={{ width: "72%" }}
        >
          <Text className="text-white font-sans font-semibold text-[17px]">
            Get Started
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
