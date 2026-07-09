import React, { useState } from "react";
import { View, Text, SafeAreaView, ScrollView } from "react-native";
import { router } from "expo-router";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";
import { PasswordStrengthChecklist } from "@/components/PasswordStrengthChecklist";
import { ConfirmSheet } from "@/components/ConfirmSheet";

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isPasswordValid = (pass: string) => {
    return (
      pass.length >= 8 &&
      /[A-Z]/.test(pass) &&
      /[a-z]/.test(pass) &&
      /[0-9]/.test(pass) &&
      /[^A-Za-z0-9]/.test(pass)
    );
  };

  const handleResetPassword = () => {
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordValid(password)) {
      setError("Password does not meet strength requirements");
      return;
    }

    setError("");
    setLoading(true);

    // Simulate password reset API
    setTimeout(() => {
      setLoading(false);
      setShowSuccessModal(true);
    }, 1500);
  };

  const handleModalConfirm = () => {
    setShowSuccessModal(false);
    // Route back to sign in
    router.replace("/auth/sign-in");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6">
        <View className="flex-1 justify-between">
          
          {/* Header */}
          <View className="mt-6 mb-8">
            <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
              Set New Password
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              Create a new password that is secure and meets the requirements.
            </Text>
          </View>

          {/* Form */}
          <View className="mb-8">
            {error ? (
              <View className="bg-like/10 border border-like/25 rounded-2xl p-4 mb-4">
                <Text className="text-like font-sans text-[14px] font-medium text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            <TextField
              label="New Password"
              placeholder="Enter new password"
              value={password}
              onChangeText={setPassword}
              isPassword
              autoCapitalize="none"
            />

            <TextField
              label="Confirm Password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isPassword
              autoCapitalize="none"
            />

            <View className="mt-4">
              <PasswordStrengthChecklist password={password} />
            </View>
          </View>

          {/* Action Button */}
          <View className="mb-6">
            <PrimaryButton
              label="Set New Password"
              onPress={handleResetPassword}
              loading={loading}
            />
          </View>

          {/* Success Modal Sheet Overlay */}
          <ConfirmSheet
            visible={showSuccessModal}
            title="Password Changed!"
            description="Your password has been successfully reset. You can now use your new password to sign in."
            actionLabel="Go to Sign In"
            onAction={handleModalConfirm}
            onCancel={handleModalConfirm} // Both buttons return to sign in
          />

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
