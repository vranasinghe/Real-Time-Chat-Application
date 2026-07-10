import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/lib/store";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { PasswordStrengthChecklist } from "@/components/PasswordStrengthChecklist";

export default function CreateAccountScreen() {
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const signUpStore = useAppStore((state) => state.signUp);

  // Quick strength validation for routing allowance
  const isPasswordValid = (pass: string) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[a-z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      /[^A-Za-z0-9]/.test(pass)
    );
  };

  const handleSignUp = async () => {
    if (!fullName || !emailOrPhone || !password) {
      setError("Please fill in all fields");
      return;
    }

    if (!isPasswordValid(password)) {
      setError("Password does not meet strength requirements");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const success = await signUpStore(emailOrPhone, password, fullName);
      setLoading(false);
      if (success) {
        // Direct to verification OTP screen
        router.push("/auth/verify-code");
      } else {
        setError("Sign up failed. Please try again.");
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || "An error occurred during sign up");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6">
        <View className="flex-1 justify-between">
          
          {/* Header */}
          <View className="mt-6 mb-8">
            <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
              Create Account
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              Join Dateza to find genuine, verified connections.
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            {error ? (
              <View className="bg-like/10 border border-like/25 rounded-2xl p-4 mb-4">
                <Text className="text-like font-sans text-[14px] font-medium text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            <TextField
              label="Full Name"
              placeholder="Enter your full name"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />

            <TextField
              label="Email or Phone"
              placeholder="Enter your email or phone number"
              value={emailOrPhone}
              onChangeText={setEmailOrPhone}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <TextField
              label="Password"
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            <View className="mt-3">
              <PasswordStrengthChecklist password={password} />
            </View>
          </View>

          {/* Sign Up Actions */}
          <View className="mb-6">
            <PrimaryButton
              label="Sign Up"
              onPress={handleSignUp}
              loading={loading}
            />

            <View className="flex-row items-center justify-center my-6">
              <View className="flex-1 h-[1px] bg-text-secondary/10" />
              <Text className="text-text-secondary font-sans text-[12px] font-semibold mx-4 uppercase tracking-wider">
                Or Continue With
              </Text>
              <View className="flex-1 h-[1px] bg-text-secondary/10" />
            </View>

            {/* Social Buttons */}
            <View className="flex-row justify-between space-x-3.5">
              <Pressable
                onPress={() => Alert.alert("Google Auth", "Google Sign Up triggered.")}
                className="flex-1 flex-row bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl py-3.5 items-center justify-center"
              >
                <Text className="text-white font-sans font-bold text-[18px]">G</Text>
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Apple Auth", "Apple Sign Up triggered.")}
                className="flex-1 flex-row bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl py-3.5 items-center justify-center"
              >
                <Text className="text-white font-sans font-bold text-[18px]"></Text>
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Facebook Auth", "Facebook Sign Up triggered.")}
                className="flex-1 flex-row bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl py-3.5 items-center justify-center"
              >
                <Text className="text-white font-sans font-bold text-[18px]">f</Text>
              </Pressable>
            </View>
          </View>

          {/* Footer */}
          <View className="items-center pb-4 flex-row justify-center">
            <Text className="text-text-secondary font-sans text-[15px]">
              Already have an account?{" "}
            </Text>
            <Pressable onPress={() => router.push("/auth/sign-in")}>
              <Text className="text-primary font-sans font-bold text-[15px]">
                Sign In
              </Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
