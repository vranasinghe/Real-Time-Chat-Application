import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { MapPin, Navigation } from "lucide-react-native";
import { PrimaryButton, GhostButton } from "@/components/PrimaryButton";

export default function LocationSetupScreen() {
  const [loading, setLoading] = useState(false);

  const handleEnableLocation = () => {
    setLoading(true);
    // Simulate permission request
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "Location Enabled",
        "Dateza has been granted location permissions to search nearby matches.",
        [
          {
            text: "Continue",
            onPress: () => router.push("/profile-setup/birthday"),
          },
        ]
      );
    }, 1500);
  };

  const handleSkip = () => {
    router.push("/profile-setup/birthday");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
        className="px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Content Box */}
        <View className="flex-1 justify-center items-center px-4">
          {/* Animated Glow Circle around MapPin */}
          <View className="relative w-40 h-40 items-center justify-center mb-8">
            <View className="w-32 h-32 rounded-full bg-primary/10 absolute animate-pulse" />
            <View className="w-24 h-24 rounded-full bg-primary/20 absolute" />
            <View className="w-16 h-16 rounded-full bg-bg-surface items-center justify-center border border-white/10 shadow-lg">
              <MapPin size={32} color="#7C5CFF" strokeWidth={1.5} />
            </View>
          </View>

          <Text className="text-white text-3xl font-bold font-display text-center mb-3">
            Location Services
          </Text>
          <Text className="text-text-secondary text-base font-sans text-center leading-6 mb-8">
            Turn on location to find people in your neighborhood. We only use your location to search for matches nearby.
          </Text>
        </View>

        {/* Action Controls */}
        <View className="w-full space-y-3.5 pb-4">
          <PrimaryButton
            label="Turn on Current Location"
            onPress={handleEnableLocation}
            loading={loading}
            icon={<Navigation size={18} color="#FFFFFF" />}
          />
          
          <GhostButton
            label="Skip for Now"
            onPress={handleSkip}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
