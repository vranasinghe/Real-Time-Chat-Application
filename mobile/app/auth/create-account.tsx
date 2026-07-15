import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { useAppStore } from "@/lib/store";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { PasswordStrengthChecklist } from "@/components/PasswordStrengthChecklist";
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

const AppleIcon = () => (
  <Svg width={20} height={20} viewBox="0 0 24 24">
    <Path
      fill="#FFFFFF"
      d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.5-1.34.02-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.19-3.14-2.41C4.25 16.91 2.94 11.85 4.6 8.95A5.07 5.07 0 0 1 8.8 6.38c1.31 0 2.55.9 3.36.9.82 0 2.25-1.11 3.8-.95a5.22 5.22 0 0 1 4.19 2.25c-.26.16-3.1 1.8-3.07 5.35.03 4.22 3.66 5.67 3.69 5.68a11.15 11.15 0 0 1-2.06 3.49M15.95 4.17a5 5 0 0 0 1.21-2.67 5.13 5.13 0 0 0-3.36 1.73 4.79 4.79 0 0 0-1.22 2.57 4.54 4.54 0 0 0 3.37-1.63z"
    />
  </Svg>
);

export default function CreateAccountScreen() {
  const [fullName, setFullName] = useState("");
  const [emailOrPhone, setEmailOrPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const signUpStore = useAppStore((state) => state.signUp);
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
            <View className="flex-row justify-center" style={{ gap: 16 }}>
              <Pressable
                onPress={handleGoogleSignIn}
                style={{ width: 64, height: 54 }}
                className="bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl items-center justify-center"
              >
                <GoogleIcon />
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Apple Auth", "Apple Sign Up triggered.")}
                style={{ width: 64, height: 54 }}
                className="bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl items-center justify-center"
              >
                <AppleIcon />
              </Pressable>

              <Pressable
                onPress={() => Alert.alert("Facebook Auth", "Facebook Sign Up triggered.")}
                style={{ width: 64, height: 54 }}
                className="bg-bg-surface border border-text-secondary/10 active:bg-text-secondary/5 rounded-2xl items-center justify-center"
              >
                <FacebookIcon />
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
