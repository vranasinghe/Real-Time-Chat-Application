import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PrimaryButton, GhostButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInStore = useAppStore((state) => state.signIn);

  const handleSignIn = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const success = await signInStore(email, password);
      setLoading(false);
      if (success) {
        // Redirect to tabs directly (fallback/mock logic auto-completes profileSetup)
        router.replace("/(tabs)");
      } else {
        setError("Invalid email or password");
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || "Failed to sign in");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6">
        <View className="flex-1 justify-between">
          {/* Header Section */}
          <View className="mt-4 mb-8">
            <Pressable
              onPress={() => router.push("/auth/get-started")}
              className="w-10 h-10 rounded-full bg-white/5 border border-white/10 items-center justify-center mb-6 active:bg-white/10"
            >
              <ArrowLeft size={20} color="#FFFFFF" />
            </Pressable>

            <Text className="text-white text-3.5xl font-bold font-display tracking-tight mb-2">
              Welcome Back!
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              Sign in to keep connecting with amazing matches.
            </Text>
          </View>

          {/* Form Fields */}
          <View className="mb-8">
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
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextField
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            <Pressable
              onPress={() => router.push("/auth/forgot-password")}
              className="self-end py-1 mt-1"
            >
              <Text className="text-primary font-sans font-semibold text-[14px]">
                Forgot password?
              </Text>
            </Pressable>
          </View>

          {/* Action Row */}
          <View className="mb-10">
            <PrimaryButton
              label="Sign In"
              onPress={handleSignIn}
              loading={loading}
            />

            <View className="flex-row items-center justify-center my-6">
              <View className="flex-1 h-[1px] bg-text-secondary/10" />
              <Text className="text-text-secondary font-sans text-[13px] font-semibold mx-4 uppercase tracking-wider">
                Or continue with
              </Text>
              <View className="flex-1 h-[1px] bg-text-secondary/10" />
            </View>

            {/* Social Buttons */}
            <View className="flex-row justify-between space-x-3.5">
              <Pressable
                onPress={() => Alert.alert("Google Auth", "Google Sign In triggered.")}
                className="flex-1 flex-row bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl py-3.5 items-center justify-center"
              >
                <View className="w-7 h-7 rounded-full bg-white items-center justify-center mr-2 shadow-sm">
                  <Text className="text-primary font-bold text-[14px]">G</Text>
                </View>
                <Text className="text-white font-sans font-semibold text-[15px]">Google</Text>
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Facebook Auth", "Facebook Sign In triggered.")}
                className="flex-1 flex-row bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl py-3.5 items-center justify-center"
              >
                <View className="w-7 h-7 rounded-full bg-[#1877F2] items-center justify-center mr-2 shadow-sm">
                  <Text className="text-white font-bold text-[14px]">f</Text>
                </View>
                <Text className="text-white font-sans font-semibold text-[15px]">Facebook</Text>
              </Pressable>
            </View>
          </View>

          {/* Footer Section */}
          <View className="items-center pb-6 flex-row justify-center">
            <Text className="text-text-secondary font-sans text-[15px]">
              Don't have any account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/auth/create-account")}>
              <Text className="text-primary font-sans font-bold text-[15px]">
                Sign Up
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
