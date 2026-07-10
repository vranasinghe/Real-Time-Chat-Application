import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Pressable, Alert, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { PrimaryButton } from "@/components/PrimaryButton";
import { OtpInput } from "@/components/OtpInput";

export default function VerifyCodeScreen() {
  const { purpose } = useLocalSearchParams<{ purpose?: string }>();
  const [code, setCode] = useState("");
  const [countdown, setCountdown] = useState(56);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Countdown timer logic
  useEffect(() => {
    if (countdown === 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleConfirm = () => {
    if (code.length < 4) {
      setError("Please enter the complete 4-digit code");
      return;
    }

    setError("");
    setLoading(true);

    // Simulate OTP verification
    setTimeout(() => {
      setLoading(false);
      if (purpose === "reset") {
        router.push("/auth/reset-password");
      } else {
        router.push("/profile-setup/location");
      }
    }, 1500);
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setCountdown(56);
    Alert.alert("Code Sent", "A new 4-digit verification code has been sent.");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }}
        className="px-6 py-6"
        showsVerticalScrollIndicator={false}
      >
        
        {/* Top Section */}
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
              Verify Code
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              Enter the 4-digit code sent to your account to verify your identity.
            </Text>
          </View>

          <View className="items-center py-6">
            {error ? (
              <View className="bg-like/10 border border-like/25 rounded-2xl p-4 mb-6 w-full">
                <Text className="text-like font-sans text-[14px] font-medium text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            <OtpInput codeLength={4} onCodeChanged={setCode} />

            {/* Countdown / Resend Option */}
            <View className="mt-8 flex-row items-center justify-center">
              {countdown > 0 ? (
                <Text className="text-text-secondary font-sans text-[14px]">
                  You can resend the code in{" "}
                  <Text className="text-primary font-bold">{countdown}s</Text>
                </Text>
              ) : (
                <Pressable onPress={handleResend} className="py-1">
                  <Text className="text-primary font-sans font-bold text-[14px] underline">
                    Resend Code
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>

        {/* Action Button */}
        <View className="w-full pb-4">
          <PrimaryButton
            label="Confirm"
            onPress={handleConfirm}
            loading={loading}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
