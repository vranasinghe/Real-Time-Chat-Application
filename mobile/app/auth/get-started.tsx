import React from "react";
import { View, Text, SafeAreaView, Pressable, Alert, ScrollView } from "react-native";
import { router } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";
import Svg, { Path } from "react-native-svg";

const GoogleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <Path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <Path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <Path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </Svg>
);

const FacebookIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#1877F2"
      d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
    />
  </Svg>
);

export default function GetStartedScreen() {
  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
        className="px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        {/* Title Section */}
        <View className="items-center justify-center mt-6 mb-4">
          {/* Let's Get Started Title & Subtitle */}
          <Text className="text-white text-3.5xl font-bold font-display text-center tracking-tight mb-3">
            Let's Get Started
          </Text>
          <Text className="text-text-secondary text-base font-sans text-center px-6 leading-6">
            Discover love, your way with Dateza
          </Text>
        </View>

        {/* Dynamic Image Frame */}
        <View className="w-full my-4">
          <ImagePlaceholder
            aspectRatio={1.1}
            source={require("../../assets/images/get-started-bg.jpg")}
          />
        </View>

        {/* Action Controls */}
        <View className="w-full space-y-4">
          <PrimaryButton
            label="Sign Up with Email"
            onPress={() => router.push("/auth/create-account")}
          />

          <Text className="text-text-secondary font-sans text-[14px] text-center my-2">
            Or Use Instant Sign Up
          </Text>

          {/* Social Sign Up Rows */}
          <View>
            {/* Google button */}
            <Pressable
              onPress={() => Alert.alert("Google Auth", "Google Sign Up flow triggered.")}
              className="w-full border border-white/10 bg-bg-surface/30 active:bg-white/5 rounded-[28px] py-4 px-6 flex-row items-center justify-center"
            >
              <GoogleIcon />
              <Text className="text-white font-sans font-semibold text-[16px] ml-3">
                Sign Up with Google
              </Text>
            </Pressable>

            {/* Facebook button */}
            <Pressable
              onPress={() => Alert.alert("Facebook Auth", "Facebook Sign Up flow triggered.")}
              style={{ marginTop: 16 }}
              className="w-full border border-white/10 bg-bg-surface/30 active:bg-white/5 rounded-[28px] py-4 px-6 flex-row items-center justify-center"
            >
              <FacebookIcon />
              <Text className="text-white font-sans font-semibold text-[16px] ml-3">
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

      </ScrollView>
    </SafeAreaView>
  );
}
