import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { MicOff, Volume2, PhoneOff, User } from "lucide-react-native";

export default function AudioCallScreen() {
  const [seconds, setSeconds] = useState(0);

  // Timer stopwatch logic
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${String(mins).padStart(2, "0")}:${String(remainingSecs).padStart(2, "0")}`;
  };

  const handleEndCall = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 justify-between items-center px-6 py-12">
        
        {/* Call Info Status */}
        <View className="items-center mt-12">
          <Text className="text-primary font-sans font-semibold text-[15px] uppercase tracking-widest mb-1.5">
            Voice Call
          </Text>
          <Text className="text-white text-3xl font-bold font-display tracking-tight">
            Elena
          </Text>
          <Text className="text-text-secondary font-sans text-base mt-2">
            {formatTime(seconds)}
          </Text>
        </View>

        {/* Big Avatar Frame */}
        <View className="w-48 h-48 rounded-full border-2 border-primary/20 items-center justify-center p-3 relative bg-primary/5">
          <View className="w-full h-full rounded-full overflow-hidden items-center justify-center bg-bg-surface">
            <Image
              source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80" }}
              className="w-full h-full object-cover"
            />
          </View>
        </View>

        {/* Bottom Control Buttons Grid */}
        <View className="w-full flex-row justify-center items-center space-x-6 pb-6">
          
          {/* Mute button */}
          <Pressable className="w-14 h-14 rounded-full bg-bg-surface border border-white/5 items-center justify-center active:bg-white/5">
            <MicOff size={20} color="#FFFFFF" />
          </Pressable>

          {/* End Call Button (Red FAB) */}
          <Pressable
            onPress={handleEndCall}
            className="w-20 h-20 rounded-full bg-like items-center justify-center active:scale-95 shadow-xl shadow-like/30"
          >
            <PhoneOff size={26} color="#FFFFFF" />
          </Pressable>

          {/* Speaker button */}
          <Pressable className="w-14 h-14 rounded-full bg-bg-surface border border-white/5 items-center justify-center active:bg-white/5">
            <Volume2 size={20} color="#FFFFFF" />
          </Pressable>

        </View>

      </View>
    </SafeAreaView>
  );
}
