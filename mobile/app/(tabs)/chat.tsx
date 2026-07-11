import React, { useState } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ScrollView,
  Image,
  StyleSheet,
  Dimensions,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useAppStore, Match } from "@/lib/store";
import Animated, { FadeInDown, FadeInRight, LinearTransition } from "react-native-reanimated";

const { width: SW } = Dimensions.get("window");

type FilterTab = "All" | "Unread" | "Groups";

export default function ConversationsScreen() {
  const { matches, messages, user } = useAppStore();
  const [activeTab, setActiveTab] = useState<FilterTab>("All");

  const getLastMessage = (matchId: string) => {
    const msgs = messages.filter((m) => m.match_id === matchId);
    return msgs.length ? msgs[msgs.length - 1] : null;
  };

  const handleMatchClick = (match: Match) => {
    router.push({ pathname: "/chat-thread", params: { matchId: match.id } });
  };

  /* Merge real matches into display-ready chat items and deduplicate by other user's ID */
  const seenUserIds = new Set<string>();
  const realChats: any[] = [];

  const matchesWithLastMsg = matches
    .filter((m) => getLastMessage(m.id))
    .map((match) => {
      const last = getLastMessage(match.id)!;
      return { match, last };
    })
    .sort((a, b) => new Date(b.last.created_at).getTime() - new Date(a.last.created_at).getTime());

  for (const item of matchesWithLastMsg) {
    const otherUserId = item.match.other_user?.id;
    if (otherUserId) {
      if (seenUserIds.has(otherUserId)) continue;
      seenUserIds.add(otherUserId);
    }

    const isOutgoing = item.last.sender_id === user?.id;
    realChats.push({
      id: item.match.id,
      name: item.match.other_user?.name ?? "Match",
      image: item.match.other_user?.photos[0] ?? "",
      lastMsg: (isOutgoing ? "You: " : "") + item.last.body,
      isOnline: item.match.other_user?.is_online ?? false,
      isOutgoing,
      unread: 0,
      time: new Date(item.last.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      matchRef: item.match,
    });
  }

  // Deduplicate new matches as well for the story avatar bubble strip
  const newMatches: Match[] = [];
  const seenNewUserIds = new Set<string>();
  for (const match of matches) {
    if (getLastMessage(match.id)) continue;
    const otherUserId = match.other_user?.id;
    if (otherUserId) {
      if (seenNewUserIds.has(otherUserId) || seenUserIds.has(otherUserId)) continue;
      seenNewUserIds.add(otherUserId);
    }
    newMatches.push(match);
  }

  const filteredChats =
    activeTab === "Unread"
      ? realChats.filter((c) => c.unread > 0)
      : realChats;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <Text style={styles.header}>Chats</Text>

        {/* ── Horizontal active-user story bubbles ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={Platform.OS === "web"}
          style={styles.storyScroll}
          contentContainerStyle={styles.storyContent}
        >
          {newMatches.map((match, index) => (
            <Animated.View
              key={match.id}
              entering={FadeInRight.delay(index * 60).springify()}
            >
              <Pressable
                onPress={() => handleMatchClick(match)}
                style={styles.storyItem}
              >
                <View style={styles.storyAvatarWrap}>
                  {match.other_user?.photos[0] ? (
                    <Image source={{ uri: match.other_user.photos[0] }} style={styles.storyAvatar} />
                  ) : (
                    <View style={[styles.storyAvatar, { backgroundColor: "#1B1035", alignItems: "center", justifyContent: "center" }]}>
                      <Text style={{ color: "#FFFFFF" }}>U</Text>
                    </View>
                  )}
                  {match.other_user?.is_online && <View style={styles.storyOnlineDot} />}
                </View>
                <Text style={styles.storyName}>{match.other_user?.name}</Text>
              </Pressable>
            </Animated.View>
          ))}
          {newMatches.length === 0 && (
            <View style={{ justifyContent: "center", paddingLeft: 10 }}>
              <Text style={{ color: "#9A8FB8", fontSize: 13, fontFamily: "Inter_400Regular" }}>
                No new matches yet.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* ── Filter tabs: All / Unread / Groups ── */}
        <View style={styles.tabRow}>
          {(["All", "Unread", "Groups"] as FilterTab[]).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabBtn, activeTab === tab && styles.tabBtnActive]}
            >
              <Text
                style={[
                  styles.tabTxt,
                  activeTab === tab && styles.tabTxtActive,
                ]}
              >
                {tab}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* ── Chat list ── */}
        <ScrollView
          showsVerticalScrollIndicator={Platform.OS === "web"}
          style={styles.chatList}
          contentContainerStyle={{ paddingBottom: 110 }}
        >
          {filteredChats.map((chat, idx) => (
            <Animated.View
              key={`${chat.id}-${idx}`}
              entering={FadeInDown.delay(idx * 50).springify()}
              layout={LinearTransition.springify()}
            >
              <Pressable
                onPress={() => {
                  if (chat.matchRef) handleMatchClick(chat.matchRef);
                }}
                style={styles.chatRow}
              >
                {/* Avatar */}
                <View style={styles.avatarWrap}>
                  {chat.image ? (
                    <Image
                      source={{ uri: chat.image }}
                      style={styles.avatar}
                    />
                  ) : (
                    <View style={[styles.avatar, styles.avatarPlaceholder]} />
                  )}
                  {chat.isOnline && <View style={styles.onlineDot} />}
                </View>

                {/* Text info */}
                <View style={styles.chatInfo}>
                  <Text style={styles.chatName}>{chat.name}</Text>
                  <Text style={styles.chatPreview} numberOfLines={1}>
                    {chat.lastMsg}
                  </Text>
                </View>

                {/* Right side: time + unread badge */}
                <View style={styles.chatMeta}>
                  <Text style={styles.chatTime}>{chat.time}</Text>
                  {chat.unread > 0 && (
                    <View style={styles.unreadBadge}>
                      <Text style={styles.unreadTxt}>
                        {chat.unread > 9 ? "9+" : chat.unread}
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          ))}

          {filteredChats.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyTxt}>No conversations yet.</Text>
            </View>
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}

/* ─────────── Styles ─────────── */
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0E0720",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },

  /* Header */
  header: {
    color: "#FFFFFF",
    fontSize: 30,
    fontFamily: "SpaceGrotesk_700Bold",
    marginBottom: 20,
  },

  /* Stories */
  storyScroll: { flexGrow: 0, marginBottom: 20 },
  storyContent: { paddingRight: 8 },
  storyItem: { alignItems: "center", marginRight: 18 },
  storyAvatarWrap: { position: "relative", marginBottom: 6 },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2A2044",
  },
  storyOnlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#0E0720",
  },
  storyName: {
    color: "#9A8FB8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },

  /* Filter tabs */
  tabRow: {
    flexDirection: "row",
    backgroundColor: "#1B1035",
    borderRadius: 999,
    padding: 4,
    marginBottom: 18,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 999,
    alignItems: "center",
  },
  tabBtnActive: {
    backgroundColor: "#7C5CFF",
  },
  tabTxt: {
    color: "#9A8FB8",
    fontSize: 13,
    fontFamily: "Inter_500Medium",
  },
  tabTxtActive: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
  },

  /* Chat list */
  chatList: { flex: 1 },
  chatRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },

  /* Avatar */
  avatarWrap: { position: "relative", marginRight: 14 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#2A2044",
  },
  avatarPlaceholder: { backgroundColor: "#2A2044" },
  onlineDot: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: "#22C55E",
    borderWidth: 2.5,
    borderColor: "#0E0720",
  },

  /* Chat info */
  chatInfo: { flex: 1, paddingRight: 8 },
  chatName: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 3,
  },
  chatPreview: {
    color: "#9A8FB8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  /* Meta: time + badge */
  chatMeta: { alignItems: "flex-end", gap: 4 },
  chatTime: {
    color: "#9A8FB8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  unreadBadge: {
    backgroundColor: "#7C5CFF",
    borderRadius: 999,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  unreadTxt: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
  },

  /* Empty */
  emptyWrap: {
    alignItems: "center",
    paddingTop: 60,
  },
  emptyTxt: {
    color: "#9A8FB8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
  },
});
