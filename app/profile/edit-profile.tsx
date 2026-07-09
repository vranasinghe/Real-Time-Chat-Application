import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, Image, Alert } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Camera, User } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TextField } from "@/components/TextField";

export default function EditProfileScreen() {
  const { user, completeSetup } = useAppStore();
  const [name, setName] = useState(user?.name || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [email, setEmail] = useState("user@dateza.com");
  const [phone, setPhone] = useState("+1 (555) 019-2834");
  const [gender, setGender] = useState(user?.gender || "male");
  const [lookingFor, setLookingFor] = useState(user?.looking_for || "female");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    setLoading(true);
    try {
      await completeSetup({
        name,
        bio,
        gender,
        looking_for: lookingFor,
      });
      setLoading(false);
      Alert.alert("Success", "Profile updated successfully!", [
        { text: "OK", onPress: () => router.back() }
      ]);
    } catch (e) {
      setLoading(false);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="px-6 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Navigation & Header */}
        <View className="w-full flex-row items-center mb-6">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/profile");
              }
            }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className="py-2 pr-4 active:opacity-60"
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>
          <Text className="text-white text-2xl font-bold font-display">
            Edit Profile
          </Text>
        </View>

        {/* Editable Avatar */}
        <View className="items-center mb-8 relative">
          <View className="w-24 h-24 rounded-full border border-white/10 overflow-hidden items-center justify-center bg-bg-surface">
            {user?.photos[0] ? (
              <Image source={{ uri: user.photos[0] }} className="w-full h-full object-cover" />
            ) : (
              <User size={36} color="#9A8FB8" />
            )}
          </View>
          <Pressable
            onPress={() => Alert.alert("Change Photo", "Profile photo upload triggered.")}
            className="absolute bottom-0 w-8 h-8 rounded-full bg-primary border border-bg-base items-center justify-center active:scale-95"
          >
            <Camera size={14} color="#FFFFFF" />
          </Pressable>
        </View>

        {/* Fields */}
        <View className="flex-1 space-y-4">
          <TextField
            label="Full Name"
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />

          <TextField
            label="Bio"
            placeholder="Write a short bio about yourself"
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={4}
            style={{ height: 100, textAlignVertical: "top" }}
          />

          <TextField
            label="Email Address"
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TextField
            label="Phone Number"
            placeholder="Enter your phone number"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Gender selection */}
          <View className="mb-2">
            <Text className="text-white/60 font-sans text-xs font-semibold mb-2.5 pl-1 uppercase tracking-wider">
              My Gender
            </Text>
            <View className="flex-row space-x-2.5">
              {["male", "female"].map((g) => {
                const isActive = gender === g;
                return (
                  <Pressable
                    key={g}
                    onPress={() => setGender(g)}
                    className={`flex-1 py-3.5 rounded-2xl border items-center justify-center ${
                      isActive ? "bg-primary border-primary" : "bg-bg-surface/30 border-white/5 active:bg-bg-surface/60"
                    }`}
                  >
                    <Text className={`font-sans text-[15px] capitalize ${isActive ? "text-white font-bold" : "text-text-secondary"}`}>
                      {g}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Looking For preferences */}
          <View className="mb-4">
            <Text className="text-white/60 font-sans text-xs font-semibold mb-2.5 pl-1 uppercase tracking-wider">
              Interested In (Looking For)
            </Text>
            <View className="flex-row space-x-2.5">
              {[
                { value: "male", label: "Men" },
                { value: "female", label: "Women" },
                { value: "everyone", label: "Everyone" },
              ].map((opt) => {
                const isActive = lookingFor === opt.value;
                return (
                  <Pressable
                    key={opt.value}
                    onPress={() => setLookingFor(opt.value)}
                    className={`flex-1 py-3.5 rounded-2xl border items-center justify-center ${
                      isActive ? "bg-primary border-primary" : "bg-bg-surface/30 border-white/5 active:bg-bg-surface/60"
                    }`}
                  >
                    <Text className={`font-sans text-[14px] ${isActive ? "text-white font-bold" : "text-text-secondary"}`}>
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Save button sticky at bottom */}
        <View className="mt-8 mb-4">
          <PrimaryButton
            label="Save Changes"
            onPress={handleSave}
            loading={loading}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
