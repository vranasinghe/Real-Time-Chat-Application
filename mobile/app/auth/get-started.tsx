import React from "react";
import { View, Text, SafeAreaView, Pressable, Alert, Image } from "react-native";
import { router } from "expo-router";
import { Mail } from "lucide-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";

export default function GetStartedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 justify-between px-6 py-6">
        
        {/* Illustration Section (dating couple style) */}
        <View className="items-center justify-center mt-6 relative">
          <View className="w-72 h-72 rounded-full bg-primary/10 blur-3xl absolute" />
          <View className="w-56 h-56 rounded-full bg-like/5 blur-2xl absolute -top-8" />
          
          {/* Couple Illustration */}
          <Image
            source={require("@/assets/images/dating_couple.png")}
            className="w-64 h-64 rounded-3xl mb-6 border border-white/10"
            resizeMode="cover"
          />

          {/* Let's Get Started Title & Subtitle */}
          <Text className="text-white text-3xl font-bold font-display text-center tracking-tight mb-2">
            Lets Get Started
          </Text>
          <Text className="text-text-secondary text-base font-sans text-center px-6 leading-6">
            Discover love, your way with Dateza
          </Text>
        </View>

        {/* Action Controls */}
        <View className="w-full space-y-4">
          <PrimaryButton
            label="Sign Up with Email"
            onPress={() => router.push("/auth/create-account")}
            icon={<Mail size={18} color="#FFFFFF" />}
          />

          <View className="flex-row items-center justify-center my-4">
            <View className="flex-1 h-[1px] bg-text-secondary/10" />
            <Text className="text-text-secondary font-sans text-[12px] font-semibold mx-4 uppercase tracking-wider">
              Or Use Instant Sign Up
            </Text>
            <View className="flex-1 h-[1px] bg-text-secondary/10" />
          </View>

          {/* Social Sign Up Rows */}
          <View className="space-y-3">
            {/* Google button */}
            <Pressable
              onPress={() => Alert.alert("Google Auth", "Google Sign Up flow triggered.")}
              className="w-full border border-white/10 bg-bg-surface/30 active:bg-white/5 rounded-[28px] py-4 px-6 flex-row items-center justify-center"
            >
              <View className="absolute left-6 w-7 h-7 rounded-full bg-white items-center justify-center shadow-sm">
                <Text className="text-primary font-bold text-[14px] leading-[18px]">G</Text>
              </View>
              <Text className="text-white font-sans font-semibold text-[16px]">
                Sign Up with Google
              </Text>
            </Pressable>

            {/* Facebook button */}
            <Pressable
              onPress={() => Alert.alert("Facebook Auth", "Facebook Sign Up flow triggered.")}
              className="w-full border border-white/10 bg-bg-surface/30 active:bg-white/5 rounded-[28px] py-4 px-6 flex-row items-center justify-center"
            >
              <View className="absolute left-6 w-7 h-7 rounded-full bg-[#1877F2] items-center justify-center shadow-sm">
                <Text className="text-white font-bold text-[14px] leading-[18px]">f</Text>
              </View>
              <Text className="text-white font-sans font-semibold text-[16px]">
                Sign Up with Facebook
              </Text>
            </Pressable>
          </View>

          {/* Sign In Footer */}
          <View className="flex-row justify-center items-center pt-6 pb-2">
            <Text className="text-text-secondary font-sans text-[14px]">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/auth/sign-in")}>
              <Text className="text-primary font-sans font-bold text-[14px]">
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
