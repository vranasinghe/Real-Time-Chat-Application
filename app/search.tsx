import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, TextInput, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Search, MoreHorizontal, Mic, Smile } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAppStore } from "@/lib/store";

interface SearchItem {
  id: string;
  name: string;
  avatar?: string;
}

export default function SearchScreen() {
  const { matches } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");

  const suggestions = matches.map((m) => ({
    id: m.id,
    name: m.other_user?.name || "Someone",
    avatar: m.other_user?.photos[0],
  }));

  const filteredSuggestions = suggestions.filter((s) =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const renderRecentSearchRow = (item: SearchItem, index: number) => {
    return (
      <Animated.View
        key={item.id}
        entering={FadeInDown.delay(index * 50).springify()}
        className="flex-row items-center justify-between bg-bg-surface/30 border border-white/5 p-4 rounded-2xl mb-3"
      >
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full border border-white/10 overflow-hidden items-center justify-center bg-bg-surface mr-3.5">
            {item.avatar ? (
              <Image source={{ uri: item.avatar }} className="w-full h-full object-cover" />
            ) : (
              <Text className="text-white">U</Text>
            )}
          </View>
          <Text className="text-white font-sans font-medium text-base">
            {item.name}
          </Text>
        </View>

        <Pressable className="w-8 h-8 rounded-full items-center justify-center active:bg-white/5">
          <MoreHorizontal size={20} color="#9A8FB8" />
        </Pressable>
      </Animated.View>
    );
  };

  // Keyboard Rows data for Custom Mockup Keyboard
  const kbRow1 = ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"];
  const kbRow2 = ["A", "S", "D", "F", "G", "H", "J", "K", "L"];
  const kbRow3 = ["Z", "X", "C", "V", "B", "N", "M"];

  const handleKeypress = (key: string) => {
    if (key === "space") {
      setSearchQuery(prev => prev + " ");
    } else if (key === "backspace") {
      setSearchQuery(prev => prev.slice(0, -1));
    } else {
      setSearchQuery(prev => prev + key.toLowerCase());
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/5">
        <Pressable
          onPress={handleBack}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          className="w-10 h-10 rounded-full items-center justify-center active:bg-white/5"
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text className="text-white font-sans font-bold text-lg text-center flex-1 pr-10">
          Search
        </Text>
        <View className="w-10" />
      </View>

      <View className="flex-1 justify-between">
        
        {/* Upper Search Content */}
        <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
          
          {/* Search Input field */}
          <View className="flex-row items-center bg-bg-surface border border-white/5 px-4 py-3.5 rounded-2xl mb-6">
            <Search size={18} color="#7C5CFF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search"
              placeholderTextColor="#9A8FB8"
              className="text-white font-sans text-[15px] ml-3.5 flex-1"
              showSoftInputOnFocus={false} // Use our custom high-fidelity overlay keyboard on web
            />
          </View>

          {/* Recent list row */}
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-text-secondary font-display text-[15px] font-bold">
              Recent
            </Text>
            <Pressable>
              <Text className="text-primary font-sans text-[12px] font-bold">
                See All
              </Text>
            </Pressable>
          </View>

          {filteredSuggestions.map(renderRecentSearchRow)}
          {filteredSuggestions.length === 0 && (
            <View className="py-10 items-center justify-center">
              <Text className="text-text-secondary font-sans text-center">
                {searchQuery ? "No matches match your query." : "No matches to search yet."}
              </Text>
            </View>
          )}
        </ScrollView>

        {/* High Fidelity Mock Keyboard Overlay (Custom Rendered for Pixel Perfect Web Preview) */}
        <View className="w-full bg-[#150d2c]/90 border-t border-white/5 px-2 py-4 space-y-2">
          
          {/* Key Row 1 */}
          <View className="flex-row justify-center space-x-1">
            {kbRow1.map(k => (
              <Pressable 
                key={k} 
                onPress={() => handleKeypress(k)}
                className="flex-1 h-11 bg-[#251b47] rounded-lg items-center justify-center active:bg-[#7C5CFF]"
              >
                <Text className="text-white font-sans text-sm font-bold">{k}</Text>
              </Pressable>
            ))}
          </View>

          {/* Key Row 2 */}
          <View className="flex-row justify-center space-x-1 px-3">
            {kbRow2.map(k => (
              <Pressable 
                key={k} 
                onPress={() => handleKeypress(k)}
                className="flex-1 h-11 bg-[#251b47] rounded-lg items-center justify-center active:bg-[#7C5CFF]"
              >
                <Text className="text-white font-sans text-sm font-bold">{k}</Text>
              </Pressable>
            ))}
          </View>

          {/* Key Row 3 */}
          <View className="flex-row justify-center items-center space-x-1.5">
            {/* Shift Key */}
            <Pressable className="w-10 h-11 bg-[#32265d] rounded-lg items-center justify-center active:bg-[#7C5CFF]">
              <Text className="text-white text-base">⬆</Text>
            </Pressable>

            {kbRow3.map(k => (
              <Pressable 
                key={k} 
                onPress={() => handleKeypress(k)}
                className="flex-1 h-11 bg-[#251b47] rounded-lg items-center justify-center active:bg-[#7C5CFF]"
              >
                <Text className="text-white font-sans text-sm font-bold">{k}</Text>
              </Pressable>
            ))}

            {/* Backspace Key */}
            <Pressable 
              onPress={() => handleKeypress("backspace")}
              className="w-10 h-11 bg-[#32265d] rounded-lg items-center justify-center active:bg-[#7C5CFF]"
            >
              <Text className="text-white text-xs font-bold">⌫</Text>
            </Pressable>
          </View>

          {/* Key Row 4 (Spacebar row) */}
          <View className="flex-row justify-center items-center space-x-1.5 pt-1">
            {/* Toggle numbers */}
            <Pressable className="w-14 h-11 bg-[#32265d] rounded-lg items-center justify-center active:bg-[#7C5CFF]">
              <Text className="text-white font-sans text-xs font-bold">123</Text>
            </Pressable>

            {/* Emoji toggle icon */}
            <Pressable className="w-10 h-11 bg-[#32265d] rounded-lg items-center justify-center active:bg-[#7C5CFF]">
              <Smile size={18} color="#FFFFFF" />
            </Pressable>

            {/* Spacebar */}
            <Pressable 
              onPress={() => handleKeypress("space")}
              className="flex-1 h-11 bg-[#251b47] rounded-lg items-center justify-center active:bg-[#7C5CFF]"
            >
              <Text className="text-text-secondary font-sans text-xs">space</Text>
            </Pressable>

            {/* Send action Button */}
            <Pressable 
              onPress={handleBack}
              className="w-16 h-11 bg-primary rounded-lg items-center justify-center active:bg-[#6A4AE0]"
            >
              <Text className="text-white font-sans text-xs font-bold">Send</Text>
            </Pressable>

            {/* Voice Dictation mic icon */}
            <Pressable className="w-10 h-11 bg-[#32265d] rounded-lg items-center justify-center active:bg-[#7C5CFF]">
              <Mic size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
}
