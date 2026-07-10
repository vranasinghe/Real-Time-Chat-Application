import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, Image, StyleSheet } from "react-native";
import { router } from "expo-router";
import { MicOff, Volume2, PhoneOff, CameraOff, Video } from "lucide-react-native";

export default function VideoCallScreen() {
  const handleEndCall = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      
      {/* Fullscreen Remote Video Placeholder (Unsplash Portrait) */}
      <Image
        source={{ uri: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1000&auto=format&fit=crop&q=80" }}
        style={StyleSheet.absoluteFill}
        className="w-full h-full object-cover"
      />

      {/* Frosted header overlay */}
      <SafeAreaView className="w-full flex-row justify-between items-center px-6 py-4 absolute top-0 left-0 right-0 bg-black/25">
        <View>
          <Text className="text-white text-2xl font-bold font-display">Elena</Text>
          <Text className="text-white/80 font-sans text-sm mt-0.5">Video Calling...</Text>
        </View>
      </SafeAreaView>

      {/* Floating PIP Self View (Bottom Right) */}
      <View className="absolute bottom-36 right-6 w-28 aspect-[3/4] rounded-2xl border border-white/20 overflow-hidden bg-bg-surface shadow-2xl">
        <Image
          source={{ uri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80" }}
          className="w-full h-full object-cover"
        />
      </View>

      {/* Bottom Floating Call Controls */}
      <View className="absolute bottom-10 left-6 right-6 flex-row justify-center items-center space-x-5 bg-black/35 px-6 py-5 rounded-[36px] border border-white/5 backdrop-blur-md">
        
        {/* Toggle Cam */}
        <Pressable className="w-12 h-12 rounded-full bg-white/10 items-center justify-center active:bg-white/20">
          <CameraOff size={18} color="#FFFFFF" />
        </Pressable>

        {/* Toggle Mic */}
        <Pressable className="w-12 h-12 rounded-full bg-white/10 items-center justify-center active:bg-white/20">
          <MicOff size={18} color="#FFFFFF" />
        </Pressable>

        {/* Toggle Speaker */}
        <Pressable className="w-12 h-12 rounded-full bg-white/10 items-center justify-center active:bg-white/20">
          <Volume2 size={18} color="#FFFFFF" />
        </Pressable>

        {/* End Call red FAB */}
        <Pressable
          onPress={handleEndCall}
          className="w-14 h-14 rounded-2xl bg-like items-center justify-center active:scale-95 shadow-lg shadow-like/40"
        >
          <PhoneOff size={22} color="#FFFFFF" />
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0720",
  },
});
