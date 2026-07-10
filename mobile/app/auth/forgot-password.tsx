import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";

export default function ForgotPasswordScreen() {
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSendOtp = () => {
    if (!emailOrPhone) {
      setError("Please enter your email or phone number");
      return;
    }
    setError("");
    setLoading(true);

    // Simulate OTP send
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        "OTP Sent",
        "A verification code has been sent to your account.",
        [
          {
            text: "OK",
            onPress: () => {
              // Redirect to verify code screen, passing reset context
              router.push({
                pathname: "/auth/verify-code",
                params: { purpose: "reset" },
              });
            },
          },
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 justify-between px-6 py-6">
        
        {/* Top Header Row */}
        <View className="w-full">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/auth/sign-in");
              }
            }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className="self-start py-2 active:opacity-60"
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>

          <View className="mt-6 mb-8">
            <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
              Forgot Password
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              Enter your email or phone number. We will send you a 4-digit verification code to reset your password.
            </Text>
          </View>

          <View>
            {error ? (
              <View className="bg-like/10 border border-like/25 rounded-2xl p-4 mb-4">
                <Text className="text-like font-sans text-[14px] font-medium text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            <TextField
              label="Email or Phone"
              placeholder="Enter your email or phone number"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Action Button */}
        <View className="w-full pb-4">
          <PrimaryButton
            label="Send Verification Code"
            onPress={handleSendOtp}
            loading={loading}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}
