import React from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";

export default function PrivacyPolicyScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 px-6 py-6">
        
        {/* Navigation Header */}
        <View className="w-full flex-row items-center mb-6">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/profile");
              }
            }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className="py-2 pr-4 active:opacity-60"
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>
          <Text className="text-white text-2xl font-bold font-display ml-2">
            Privacy Policy
          </Text>
        </View>

        {/* Policy Content */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <Text className="text-primary text-[15px] font-sans font-semibold mb-6">
            Effective Date: December 20, 2028
          </Text>

          {/* Section 1 */}
          <Text className="text-white font-sans font-bold text-base mb-2">
            1. Information Collection
          </Text>
          <Text className="text-text-secondary font-sans text-[14px] leading-6 mb-6">
            We collect essential information to enhance your experience. This includes details you provide directly, such as account data, as well as information gathered through usage analytics and cookies.
          </Text>

          {/* Section 2 */}
          <Text className="text-white font-sans font-bold text-base mb-2">
            2. Information Usage
          </Text>
          <Text className="text-text-secondary font-sans text-[14px] leading-6 mb-6">
            The information collected is used to improve our services, provide personalized recommendations, and ensure a seamless experience. We do not share your data without your explicit consent.
          </Text>

          {/* Section 3 */}
          <Text className="text-white font-sans font-bold text-base mb-2">
            3. Information Setting
          </Text>
          <Text className="text-text-secondary font-sans text-[14px] leading-6 mb-6">
            You have full control over your data. Manage your privacy preferences, update personal details, and customize your settings to match your needs.
          </Text>

          {/* Section 4 */}
          <Text className="text-white font-sans font-bold text-base mb-2">
            4. Security Measures
          </Text>
          <Text className="text-text-secondary font-sans text-[14px] leading-6 mb-8">
            We prioritize your data's safety with advanced security protocols, encryption methods, and regular audits to protect against unauthorized access or breaches.
          </Text>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
