import React from "react";
import { View, Text, SafeAreaView, ScrollView, Pressable, Image } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, MoreHorizontal, Heart, MessageSquare, UserCheck } from "lucide-react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useAppStore } from "@/lib/store";

interface NotificationItem {
  id: string;
  type: "match" | "message" | "like";
  text: string;
  time: string;
  avatar?: string;
}

export default function NotificationsScreen() {
  const { matches, messages, likesYou, user } = useAppStore();

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(tabs)");
    }
  };

  const renderIcon = (type: "match" | "message" | "like") => {
    switch (type) {
      case "match":
        return <UserCheck size={12} color="#7C5CFF" />;
      case "message":
        return <MessageSquare size={12} color="#7C5CFF" />;
      case "like":
        return <Heart size={12} color="#FF2E6E" />;
      default:
        return null;
    }
  };

  const matchNotifications = matches.map((m) => ({
    id: `notif-match-${m.id}`,
    type: "match" as const,
    text: `${m.other_user?.name || "Someone"} matched with you!`,
    time: new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatar: m.other_user?.photos[0],
    rawTime: new Date(m.created_at),
  }));

  const lastMessages = matches
    .map((m) => {
      const msgs = messages.filter((msg) => msg.match_id === m.id && msg.sender_id !== user?.id);
      return msgs.length ? msgs[msgs.length - 1] : null;
    })
    .filter((msg): msg is NonNullable<typeof msg> => msg !== null);

  const messageNotifications = lastMessages.map((msg) => {
    const m = matches.find((match) => match.id === msg.match_id);
    return {
      id: `notif-msg-${msg.id}`,
      type: "message" as const,
      text: `${m?.other_user?.name || "Someone"} sent you a message: "${msg.body}"`,
      time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: m?.other_user?.photos[0],
      rawTime: new Date(msg.created_at),
    };
  });

  const likeNotifications = likesYou.map((profile) => ({
    id: `notif-like-${profile.id}`,
    type: "like" as const,
    text: `${profile.name} liked your profile!`,
    time: "Today",
    avatar: profile.photos[0],
    rawTime: new Date(),
  }));

  const allNotifs = [...matchNotifications, ...messageNotifications, ...likeNotifications]
    .sort((a, b) => b.rawTime.getTime() - a.rawTime.getTime());

  const now = new Date();
  const todayNotifs = allNotifs.filter((n) => (now.getTime() - n.rawTime.getTime()) < 24 * 60 * 60 * 1000);
  const earlierNotifs = allNotifs.filter((n) => (now.getTime() - n.rawTime.getTime()) >= 24 * 60 * 60 * 1000);

  const renderNotifRow = (item: NotificationItem, index: number) => {
    return (
      <Animated.View
        key={item.id}
        entering={FadeInDown.delay(index * 50).springify()}
        className="flex-row items-center justify-between bg-bg-surface/30 border border-white/5 p-4 rounded-2xl mb-3"
      >
        <View className="flex-row items-center flex-1 pr-3">
          {/* Avatar and relative badge */}
          <View className="relative mr-3.5">
            <View className="w-12 h-12 rounded-full border border-white/10 overflow-hidden items-center justify-center bg-bg-surface">
              {item.avatar ? (
                <Image source={{ uri: item.avatar }} className="w-full h-full object-cover" />
              ) : (
                <Text className="text-white">U</Text>
              )}
            </View>
            <View className="absolute bottom-0 right-0 w-5.5 h-5.5 rounded-full bg-bg-surface border border-white/5 items-center justify-center">
              {renderIcon(item.type)}
            </View>
          </View>

          {/* Text & Time */}
          <View className="flex-1">
            <Text className="text-white font-sans font-medium text-[15px] leading-5 mb-1 pr-1">
              {item.text}
            </Text>
            <Text className="text-text-secondary font-sans text-[11px]">
              {item.time}
            </Text>
          </View>
        </View>

        {/* More Actions */}
        <Pressable className="w-8 h-8 rounded-full items-center justify-center active:bg-white/5">
          <MoreHorizontal size={20} color="#9A8FB8" />
        </Pressable>
      </Animated.View>
    );
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
          Notification
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
        {todayNotifs.length > 0 && (
          <>
            <Text className="text-text-secondary font-display text-[15px] font-bold mb-3 mt-2">
              Recent
            </Text>
            {todayNotifs.map((item, idx) => renderNotifRow(item, idx))}
          </>
        )}

        {earlierNotifs.length > 0 && (
          <>
            <Text className="text-text-secondary font-display text-[15px] font-bold mb-3 mt-6">
              Earlier
            </Text>
            {earlierNotifs.map((item, idx) => renderNotifRow(item, idx + todayNotifs.length))}
          </>
        )}

        {allNotifs.length === 0 && (
          <View className="flex-1 py-20 items-center justify-center">
            <Text className="text-text-secondary font-sans text-center">
              No new notifications.
            </Text>
          </View>
        )}
      </ScrollView>

    </SafeAreaView>
  );
}
