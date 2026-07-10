import React, { useState, useEffect } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, Image } from "react-native";
import { router } from "expo-router";
import { Heart, Navigation, Info } from "lucide-react-native";
import { useAppStore, Profile } from "@/lib/store";
import { Chip } from "@/components/Chip";
import { Badge } from "@/components/Badge";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function LikesScreen() {
  const { likesYou, user, recordSwipe, fetchLikesYou } = useAppStore();
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "New", "Nearby", "Recently Match"];

  useEffect(() => {
    fetchLikesYou();
  }, []);

  const handleLikeBack = async (profile: Profile) => {
    // Record mutual swipe to trigger match celebratory overlay
    await recordSwipe(profile.id, "like");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 px-4 py-3">
        
        {/* Header */}
        <View className="mb-4 mt-2">
          <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
            Likes You
          </Text>
          <Text className="text-text-secondary text-sm font-sans">
            Discover your favorite people who already liked you.
          </Text>
        </View>

        {/* Filter Chips */}
        <View className="mb-6">
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {filters.map((filter) => (
              <View key={filter} className="mr-2.5">
                <Chip
                  label={filter}
                  active={activeFilter === filter}
                  onPress={() => setActiveFilter(filter)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Grid Lists */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="flex-row flex-wrap justify-between">
            {likesYou.map((profile, index) => (
              <Animated.View
                key={profile.id}
                entering={FadeInDown.delay(index * 60).springify()}
                className="w-[48%] bg-bg-surface border border-white/5 rounded-3xl overflow-hidden mb-4 relative"
              >
                {/* Image display */}
                <View className="aspect-[3/4] w-full relative">
                  {profile.photos[0] ? (
                    <Image source={{ uri: profile.photos[0] }} className="w-full h-full object-cover" />
                  ) : (
                    <View className="flex-1 bg-bg-surface items-center justify-center">
                      <Heart size={20} color="#9A8FB8" />
                    </View>
                  )}

                  {/* Frosted Badges Top Left */}
                  <View className="absolute top-3 left-3 flex-row space-x-1">
                    <Badge label={`${profile.match_percent}%`} />
                  </View>



                  {/* Floating Action Button (Like Back) */}
                  <Pressable
                    onPress={() => handleLikeBack(profile)}
                    className="absolute bottom-3 right-3 w-10 h-10 rounded-full bg-like items-center justify-center shadow-lg active:scale-95"
                  >
                    <Heart size={18} color="#FFFFFF" fill="#FFFFFF" />
                  </Pressable>
                </View>

                {/* Card labels */}
                <View className="p-3 bg-bg-surface">
                  <Text className="text-white font-bold font-sans text-base">
                    {profile.name}, {new Date().getFullYear() - new Date(profile.birthdate).getFullYear()}
                  </Text>
                  <Text className="text-text-secondary text-[11px] font-sans mt-0.5" numberOfLines={1}>
                    Active today
                  </Text>
                </View>
              </Animated.View>
            ))}

            {likesYou.length === 0 && (
              <View className="w-full py-20 items-center justify-center">
                <Text className="text-text-secondary font-sans text-center">
                  No likes yet. Try swiping more in discovery!
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
