import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable } from "react-native";
import { router } from "expo-router";
import { ArrowRight } from "lucide-react-native";
import { PrimaryButton, GhostButton } from "@/components/PrimaryButton";
import { ImagePlaceholder } from "@/components/ImagePlaceholder";

export default function OnboardingScreen() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Swipe. Match. Chat.",
      subtitle: "Meet new people instantly with a simple swipe.",
      buttonLabel: "Get Started",
    },
    {
      title: "Real People. Real Connections.",
      subtitle: "No bots, no spam—just genuine profiles near you.",
      buttonLabel: "Keep Going",
    },
    {
      title: "Real People. Real Connections.",
      subtitle: "No bots, no spam—just genuine profiles near you.",
      buttonLabel: "Start Matching",
    },
  ];

  const handleNext = () => {
    if (activeSlide < slides.length - 1) {
      setActiveSlide(activeSlide + 1);
    } else {
      router.push("/auth/get-started");
    }
  };

  const handleSkip = () => {
    router.push("/auth/get-started");
  };

  const currentSlide = slides[activeSlide];

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 justify-between px-6 py-6">
        {/* Top Navigation & Progress Bar */}
        <View className="w-full">
          {/* Segmented Progress Indicators */}
          <View className="flex-row space-x-2.5 mb-6">
            {slides.map((_, index) => (
              <View
                key={index}
                className={`flex-1 h-1.5 rounded-full ${
                  index <= activeSlide ? "bg-primary" : "bg-bg-surface border border-white/5"
                }`}
              />
            ))}
          </View>

          {/* Skip Button */}
          {activeSlide < slides.length - 1 && (
            <Pressable onPress={handleSkip} className="self-end py-1">
              <Text className="text-text-secondary font-sans font-medium text-[14px]">
                Skip
              </Text>
            </Pressable>
          )}
        </View>

        {/* Dynamic Image Frame */}
        <View className="w-full my-6">
          <ImagePlaceholder aspectRatio={1.1} />
        </View>

        {/* Content Section */}
        <View className="items-center px-2 mb-8">
          <Text className="text-white text-3xl font-bold font-display text-center mb-3.5 tracking-tight leading-9">
            {currentSlide.title}
          </Text>
          <Text className="text-text-secondary text-base font-sans text-center leading-6">
            {currentSlide.subtitle}
          </Text>
        </View>

        {/* Bottom Button Action */}
        <View className="w-full pb-4">
          <PrimaryButton
            label={currentSlide.buttonLabel}
            onPress={handleNext}
            icon={
              activeSlide === slides.length - 1 ? (
                <ArrowRight size={18} color="#FFFFFF" />
              ) : undefined
            }
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
