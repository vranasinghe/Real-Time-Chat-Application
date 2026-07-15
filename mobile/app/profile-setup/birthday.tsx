import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Calendar } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PrimaryButton, GhostButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";

export default function BirthdaySetupScreen() {
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [error, setError] = useState("");

  const completeSetup = useAppStore((state) => state.completeSetup);

  const handleNext = async () => {
    if (!day || !month || !year) {
      setError("Please fill in your complete birthdate");
      return;
    }

    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);

    if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
      setError("Invalid day");
      return;
    }
    if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      setError("Invalid month");
      return;
    }
    if (isNaN(yearNum) || yearNum < 1920 || yearNum > 2008) {
      setError("You must be at least 18 years old to join Dateza");
      return;
    }

    setError("");
    const birthdateString = `${yearNum}-${String(monthNum).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    
    // Save locally or sync to Supabase
    // Note: completeSetup will be final at the end of the wizard, for now we pass intermediate values or update the local user session
    // We can update the store state directly
    useAppStore.setState((state) => {
      if (state.user) {
        return { user: { ...state.user, birthdate: birthdateString } };
      }
      return {};
    });

    router.push("/profile-setup/height");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }} className="px-6 py-6">
        <View className="w-full">
          
          {/* Header */}
          <View className="mt-8 mb-10">
            <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
              {"When's your Birthday?"}
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              {"Your age will be visible to your matches, but we don't display your actual birth date."}
            </Text>
          </View>

          {/* Form / Grid Picker */}
          <View>
            {error ? (
              <View className="bg-like/10 border border-like/25 rounded-2xl p-4 mb-6">
                <Text className="text-like font-sans text-[14px] font-medium text-center">
                  {error}
                </Text>
              </View>
            ) : null}

            {/* Inputs in 3-column row */}
            <View className="flex-row space-x-3.5 mb-6">
              <View className="flex-1">
                <TextField
                  label="Day"
                  placeholder="DD"
                  value={day}
                  onChangeText={setDay}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Month"
                  placeholder="MM"
                  value={month}
                  onChangeText={setMonth}
                  keyboardType="number-pad"
                  maxLength={2}
                />
              </View>
              <View className="flex-1">
                <TextField
                  label="Year"
                  placeholder="YYYY"
                  value={year}
                  onChangeText={setYear}
                  keyboardType="number-pad"
                  maxLength={4}
                />
              </View>
            </View>

            <View className="flex-row items-center space-x-2 bg-bg-surface border border-white/5 p-4 rounded-2xl mt-4">
              <Calendar size={20} color="#9A8FB8" />
              <Text className="text-text-secondary font-sans text-[13px] leading-5">
                Must be at least 18 years old to join Dateza.
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View className="w-full space-y-3.5 pb-4 mt-8">
          <PrimaryButton
            label="Next"
            onPress={handleNext}
          />
          <GhostButton
            label="Skip"
            onPress={() => router.push("/profile-setup/height")}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
