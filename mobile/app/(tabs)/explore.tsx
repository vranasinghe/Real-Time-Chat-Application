import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, TextInput, Image, Modal, Alert } from "react-native";
import { router } from "expo-router";
import { Search, MapPin, X, Heart, MessageSquare, Compass } from "lucide-react-native";
import { useAppStore, Profile } from "@/lib/store";
import { Chip } from "@/components/Chip";
import { Badge } from "@/components/Badge";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function ExploreScreen() {
  const { profiles, user, recordSwipe } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);

  const filters = ["All", "Nearby", "New", "Recently Active"];

  // Filter profiles based on search query and selected filter
  const filteredProfiles = profiles.filter((p) => {
    if (p.id === user?.id) return false;
    
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.interests.some(i => i.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeFilter === "Nearby") return p.lat !== undefined;
    if (activeFilter === "New") return true;
    if (activeFilter === "Recently Active") return p.is_online;
    return true;
  });

  const handleMessagePress = async (profile: Profile) => {
    setSelectedProfile(null);
    await useAppStore.getState().createQuickMatch(profile);
    router.replace("/(tabs)/chat");
  };

  const handleLikePress = async (profile: Profile) => {
    setSelectedProfile(null);
    await recordSwipe(profile.id, "like");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 px-4 py-3">
        
        {/* Header */}
        <View className="mb-4 mt-2">
          <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
            Explore
          </Text>
          <Text className="text-text-secondary text-sm font-sans">
            Find matches by interests, name, or keywords.
          </Text>
        </View>

        {/* Search Field */}
        <View className="flex-row items-center bg-bg-surface border border-white/5 px-4 py-3.5 rounded-2xl mb-4">
          <Search size={18} color="#9A8FB8" />
          <TextInput
            placeholder="Search name, interests, tags..."
            placeholderTextColor="#9A8FB8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="text-white font-sans text-[15px] ml-3.5 flex-1 p-0"
            autoCapitalize="none"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery("")}>
              <X size={18} color="#9A8FB8" />
            </Pressable>
          ) : null}
        </View>

        {/* Filter Chips Row */}
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

        {/* List of profiles grid */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          <View className="flex-row flex-wrap justify-between">
            {filteredProfiles.map((profile, index) => (
              <Animated.View
                key={profile.id}
                entering={FadeInDown.delay(index * 60).springify()}
                className="w-[48%] mb-4"
              >
                <Pressable
                  onPress={() => setSelectedProfile(profile)}
                  className="w-full bg-bg-surface border border-white/5 rounded-3xl overflow-hidden active:opacity-90"
                >
                  {/* Photo cover */}
                  <View className="aspect-square w-full relative">
                    {profile.photos[0] ? (
                      <Image source={{ uri: profile.photos[0] }} className="w-full h-full object-cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center bg-bg-surface">
                        <Compass size={24} color="#9A8FB8" />
                      </View>
                    )}

                    {/* Frosted Match Badge */}
                    <View className="absolute top-3 left-3">
                      <Badge label={`${profile.match_percent}%`} />
                    </View>
                  </View>

                  {/* Profile mini info */}
                  <View className="p-3">
                    <Text className="text-white font-bold font-sans text-base" numberOfLines={1}>
                      {profile.name}, {new Date().getFullYear() - new Date(profile.birthdate).getFullYear()}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            ))}

            {filteredProfiles.length === 0 && (
              <View className="w-full py-20 items-center justify-center">
                <Text className="text-text-secondary font-sans text-center">
                  No matching profiles found.
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* User Detail modal sheet */}
        <Modal
          visible={selectedProfile !== null}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setSelectedProfile(null)}
        >
          {selectedProfile && (
            <View className="flex-1 bg-black/60 justify-end">
              <View className="bg-bg-base border-t border-white/10 rounded-t-[36px] h-[85%] relative overflow-hidden">
                <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                  
                  {/* Photo Carousel placeholder */}
                  <View className="w-full aspect-[4/3] relative bg-bg-surface">
                    {selectedProfile.photos[0] ? (
                      <Image source={{ uri: selectedProfile.photos[0] }} className="w-full h-full object-cover" />
                    ) : (
                      <View className="flex-1 items-center justify-center">
                        <Compass size={40} color="#9A8FB8" />
                      </View>
                    )}
                    
                    {/* Floating Badges */}
                    <View className="absolute top-6 left-6 flex-row space-x-2">
                      <Badge label={`${selectedProfile.match_percent}% Match`} />
                      <Badge label="1.4 Km" />
                    </View>

                    {/* Close Button */}
                    <Pressable
                      onPress={() => setSelectedProfile(null)}
                      className="absolute top-6 right-6 w-10 h-10 rounded-full bg-black/40 items-center justify-center border border-white/10"
                    >
                      <X size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>

                  {/* Body Details */}
                  <View className="p-6">
                    <View className="flex-row items-center justify-between mb-4">
                      <View>
                        <Text className="text-white text-3xl font-bold font-display italic">
                          {selectedProfile.name}, {new Date().getFullYear() - new Date(selectedProfile.birthdate).getFullYear()}
                        </Text>
                        <View className="flex-row items-center mt-1.5">
                          <MapPin size={14} color="#9A8FB8" />
                          <Text className="text-text-secondary text-[13px] font-sans ml-1">
                            New York, USA (1.4 km away)
                          </Text>
                        </View>
                      </View>

                      {/* Online state */}
                      {selectedProfile.is_online && (
                        <View className="flex-row items-center bg-online/10 border border-online/20 px-3 py-1 rounded-full">
                          <View className="w-2 h-2 rounded-full bg-online mr-1.5" />
                          <Text className="text-online text-[12px] font-sans font-bold">Online</Text>
                        </View>
                      )}
                    </View>

                    {/* About me */}
                    <Text className="text-white font-display text-lg font-bold mb-2">About Me</Text>
                    <Text className="text-text-secondary font-sans text-[15px] leading-6 mb-6">
                      {selectedProfile.bio}
                    </Text>

                    {/* Interests */}
                    <Text className="text-white font-display text-lg font-bold mb-3">Interests</Text>
                    <View className="flex-row flex-wrap mb-6">
                      {selectedProfile.interests.map((interest) => (
                        <View key={interest} className="mr-2 mb-2">
                          <Chip label={interest} active={true} />
                        </View>
                      ))}
                    </View>

                    {/* General Specs */}
                    <View className="bg-bg-surface border border-white/5 rounded-2xl p-4 space-y-3 mb-10">
                      <View className="flex-row justify-between">
                        <Text className="text-text-secondary font-sans">Height</Text>
                        <Text className="text-white font-sans font-bold">{selectedProfile.height_cm} cm</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-text-secondary font-sans">Gender</Text>
                        <Text className="text-white font-sans font-bold capitalize">{selectedProfile.gender}</Text>
                      </View>
                      <View className="flex-row justify-between">
                        <Text className="text-text-secondary font-sans">Looking For</Text>
                        <Text className="text-white font-sans font-bold capitalize">{selectedProfile.looking_for}</Text>
                      </View>
                    </View>

                  </View>
                </ScrollView>

                {/* Bottom Sticky Action Bar */}
                <View className="absolute bottom-0 left-0 right-0 p-6 bg-bg-base/95 border-t border-white/5 flex-row space-x-4">
                  <Pressable
                    onPress={() => handleLikePress(selectedProfile)}
                    className="flex-1 bg-like rounded-2xl py-3.5 items-center justify-center flex-row"
                  >
                    <Heart size={18} color="#FFFFFF" fill="#FFFFFF" className="mr-2" />
                    <Text className="text-white font-sans font-bold text-base">Like Back</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => handleMessagePress(selectedProfile)}
                    className="flex-1 bg-primary rounded-2xl py-3.5 items-center justify-center flex-row"
                  >
                    <MessageSquare size={18} color="#FFFFFF" className="mr-2" />
                    <Text className="text-white font-sans font-bold text-base">Send Message</Text>
                  </Pressable>
                </View>

              </View>
            </View>
          )}
        </Modal>

      </View>
    </SafeAreaView>
  );
}
