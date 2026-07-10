import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PrimaryButton } from "@/components/PrimaryButton";

const SUGGESTED_LANGUAGES = [
  { code: "en-US", label: "English (US)" },
  { code: "en-GB", label: "English (UK)" },
];

const OTHER_LANGUAGES = [
  { code: "es", label: "Spanish" },
  { code: "hi", label: "Hindi" },
  { code: "zh", label: "Mandarin" },
  { code: "bn", label: "Bengali" },
  { code: "id", label: "Indonesian" },
];

export default function LanguageSetupScreen() {
  const [selectedLang, setSelectedLang] = useState("en-US");
  const [loading, setLoading] = useState(false);

  const name = useAppStore.getState().user?.name || "";
  const isFemale = /jane|female|girl|woman/i.test(name);

  const [gender, setGender] = useState(isFemale ? "female" : "male");
  const [lookingFor, setLookingFor] = useState(isFemale ? "male" : "female");

  const completeSetup = useAppStore((state) => state.completeSetup);

  const handleNext = async () => {
    setLoading(true);
    
    // Complete profile setup in store
    const selectedLabel = 
      SUGGESTED_LANGUAGES.find(l => l.code === selectedLang)?.label ||
      OTHER_LANGUAGES.find(l => l.code === selectedLang)?.label || 
      "English (US)";

    try {
      await completeSetup({
        interests: ["Music", "Coffee", "Design", "Tacos"], // Seed defaults to complete profile
        birthdate: useAppStore.getState().user?.birthdate || "1999-01-01",
        height_cm: useAppStore.getState().user?.height_cm || 175,
        photos: useAppStore.getState().user?.photos || [
          gender === "female"
            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80" // Female photo
            : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80" // Male photo
        ],
        gender: gender,
        looking_for: lookingFor,
        bio: "Just finished setting up my Dateza profile! Let's connect.",
      });

      setLoading(false);
      // Route to core tabs layout
      router.replace("/(tabs)");
    } catch (e) {
      setLoading(false);
      console.error("Failed completing signup wizard", e);
    }
  };

  const renderRadioItem = (code: string, label: string) => {
    const isActive = selectedLang === code;
    return (
      <Pressable
        key={code}
        onPress={() => setSelectedLang(code)}
        className={`flex-row justify-between items-center bg-bg-surface px-4 py-4 rounded-2xl mb-3.5 border ${
          isActive ? "border-primary" : "border-white/5"
        } active:bg-white/5`}
      >
        <Text className={`font-sans text-[16px] ${isActive ? "text-white font-bold" : "text-text-secondary"}`}>
          {label}
        </Text>
        <View className={`w-6 h-6 rounded-full border items-center justify-center ${
          isActive ? "bg-primary border-primary" : "border-text-secondary/35"
        }`}>
          {isActive && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 justify-between px-6 py-6">
        
        {/* Scrollable Content */}
        <ScrollView className="flex-1 mt-6" showsVerticalScrollIndicator={false}>
          
          {/* Gender selection */}
          <Text className="text-white font-display text-[18px] font-bold mb-3 pl-1">
            My Gender
          </Text>
          <View className="flex-row space-x-3 mb-6">
            {["male", "female"].map((g) => {
              const isActive = gender === g;
              return (
                <Pressable
                  key={g}
                  onPress={() => setGender(g)}
                  className={`flex-1 py-4 rounded-2xl border items-center justify-center ${
                    isActive ? "bg-primary border-primary" : "bg-bg-surface border-white/5 active:bg-white/5"
                  }`}
                >
                  <Text className={`font-sans text-[16px] capitalize ${isActive ? "text-white font-bold" : "text-text-secondary"}`}>
                    {g}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Looking For preferences */}
          <Text className="text-white font-display text-[18px] font-bold mb-3 pl-1">
            Interested In (Looking For)
          </Text>
          <View className="flex-row space-x-2.5 mb-8">
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
                  className={`flex-1 py-4 rounded-2xl border items-center justify-center ${
                    isActive ? "bg-primary border-primary" : "bg-bg-surface border-white/5 active:bg-white/5"
                  }`}
                >
                  <Text className={`font-sans text-[15px] ${isActive ? "text-white font-bold" : "text-text-secondary"}`}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Header */}
          <View className="mb-8 border-t border-white/5 pt-6">
            <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
              Select your Language
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              Choose your primary language for displaying profile details and messaging.
            </Text>
          </View>

          {/* Suggested List */}
          <Text className="text-white font-display text-[18px] font-bold mb-4">
            Suggested
          </Text>
          <View className="mb-6">
            {SUGGESTED_LANGUAGES.map((lang) => renderRadioItem(lang.code, lang.label))}
          </View>

          {/* Others List */}
          <Text className="text-white font-display text-[18px] font-bold mb-4">
            Others
          </Text>
          <View className="mb-8">
            {OTHER_LANGUAGES.map((lang) => renderRadioItem(lang.code, lang.label))}
          </View>

        </ScrollView>

        {/* Action Button */}
        <View className="w-full pb-4 pt-4">
          <PrimaryButton
            label="Complete Profile"
            onPress={handleNext}
            loading={loading}
          />
        </View>

      </View>
    </SafeAreaView>
  );
}
