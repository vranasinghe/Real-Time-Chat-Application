import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff, ArrowLeft } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PrimaryButton, GhostButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
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

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const signInStore = useAppStore((state) => state.signIn);
  const signInWithGoogle = useAppStore((state) => state.signInWithGoogle);

  const handleGoogleSignIn = async () => {
    setError("");
    setLoading(true);
    try {
      const success = await signInWithGoogle();
      setLoading(false);
      if (success) {
        const setupComplete = useAppStore.getState().profileSetupComplete;
        if (setupComplete) {
          router.replace("/(tabs)");
        } else {
          router.replace("/profile-setup/birthday");
        }
      }
    } catch (e: any) {
      setLoading(false);
      setError(e.message || "Google Sign-In failed.");
    }
  };

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
            <View className="flex-row justify-between" style={{ gap: 12 }}>
              <Pressable
                onPress={handleGoogleSignIn}
                className="flex-1 flex-row bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl py-3.5 items-center justify-center"
              >
                <GoogleIcon />
                <Text className="text-white font-sans font-semibold text-[15px] ml-2">Google</Text>
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Facebook Auth", "Facebook Sign In triggered.")}
                className="flex-1 flex-row bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl py-3.5 items-center justify-center"
              >
                <FacebookIcon />
                <Text className="text-white font-sans font-semibold text-[15px] ml-2">Facebook</Text>
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
