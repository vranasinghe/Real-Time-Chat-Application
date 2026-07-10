import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
  StyleSheet,
  StatusBar,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Phone,
  Video,
  Plus,
  Mic,
  Send,
  Image as ImageIcon,
  MapPin,
  User,
  FileText,
  X,
} from "lucide-react-native";
import { useAppStore, Message } from "@/lib/store";
import Animated, { FadeInUp, LinearTransition } from "react-native-reanimated";

export default function ChatThreadScreen() {
  const { matchId } = useLocalSearchParams<{ matchId: string }>();
  const { matches, loadMessagesForMatch, sendMessage, user, messages } =
    useAppStore();
  const insets = useSafeAreaInsets();
  const [messagesList, setMessagesList] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [showAttachmentSheet, setShowAttachmentSheet] = useState(false);

  const scrollViewRef = useRef<ScrollView>(null);

  const match = matches.find((m) => m.id === matchId);
  const otherUser = match?.other_user;

  useEffect(() => {
    if (matchId) {
      setMessagesList(loadMessagesForMatch(matchId));
      const socket = useAppStore.getState().getSocketConnection();
      if (socket) socket.emit("join_room", matchId);
    }
    return () => {
      if (matchId) {
        const socket = useAppStore.getState().getSocketConnection();
        if (socket) socket.emit("leave_room", matchId);
      }
    };
  }, [matchId, loadMessagesForMatch, messages]);

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messagesList]);

  const handleGoBack = () => {
    try {
      router.back();
    } catch {
      router.replace("/(tabs)/chat");
    }
  };

  const handleSend = async () => {
    if (!text.trim() || !matchId) return;
    const bodyText = text.trim();
    setText("");
    await sendMessage(matchId, bodyText, "text");
    setMessagesList(loadMessagesForMatch(matchId));
  };

  const handleAttachmentOption = (type: string) => {
    setShowAttachmentSheet(false);
    Alert.alert("Attachment Triggered", `Sharing ${type} in chat...`, [
      {
        text: "Send Mock",
        onPress: async () => {
          if (!matchId) return;
          await sendMessage(
            matchId,
            type === "Location"
              ? "📍 Current Location shared"
              : `📎 Mock ${type} attachment`,
            type === "Location" ? "location" : "text"
          );
          setMessagesList(loadMessagesForMatch(matchId));
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const renderBubble = (msg: Message) => {
    const isMe = msg.sender_id === user?.id;
    return (
      <Animated.View
        key={msg.id}
        entering={FadeInUp.springify()}
        layout={LinearTransition.springify()}
        style={[
          styles.bubbleRow,
          isMe ? styles.bubbleRowMe : styles.bubbleRowThem,
        ]}
      >
        <View
          style={[
            styles.bubble,
            isMe ? styles.bubbleMe : styles.bubbleThem,
          ]}
        >
          <Text style={styles.bubbleText}>{msg.body}</Text>
          <Text style={styles.bubbleTime}>
            {new Date(msg.created_at).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </Animated.View>
    );
  };

  const attachmentOptions = [
    {
      label: "Document",
      icon: FileText,
      bg: "rgba(59, 130, 246, 0.1)",
      border: "rgba(59, 130, 246, 0.2)",
      color: "#3B82F6",
    },
    {
      label: "Camera",
      icon: Video,
      bg: "rgba(239, 68, 68, 0.1)",
      border: "rgba(239, 68, 68, 0.2)",
      color: "#EF4444",
    },
    {
      label: "Gallery",
      icon: ImageIcon,
      bg: "rgba(16, 185, 129, 0.1)",
      border: "rgba(16, 185, 129, 0.2)",
      color: "#10B981",
    },
    {
      label: "Audio",
      icon: Mic,
      bg: "rgba(245, 158, 11, 0.1)",
      border: "rgba(245, 158, 11, 0.2)",
      color: "#F59E0B",
    },
    {
      label: "Contact",
      icon: User,
      bg: "rgba(236, 72, 153, 0.1)",
      border: "rgba(236, 72, 153, 0.2)",
      color: "#EC4899",
    },
  ];

  return (
    <View style={[styles.safeArea, { paddingTop: insets.top || StatusBar.currentHeight || 0 }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.flex1}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={handleGoBack}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              style={({ pressed }) => [
                styles.backBtn,
                pressed && { opacity: 0.5, transform: [{ scale: 0.92 }] },
              ]}
            >
              <ArrowLeft size={22} color="#FFFFFF" strokeWidth={2.5} />
            </Pressable>

            <View style={styles.avatarRow}>
              <View style={styles.avatarWrap}>
                {otherUser?.photos[0] ? (
                  <Image
                    source={{ uri: otherUser.photos[0] }}
                    style={styles.avatar}
                  />
                ) : (
                  <Text style={styles.avatarPlaceholderText}>U</Text>
                )}
                {otherUser?.is_online && <View style={styles.onlineDot} />}
              </View>
              <View>
                <Text style={styles.headerName}>
                  {otherUser?.name || "Match"}
                </Text>
                <Text style={styles.headerStatus}>
                  {otherUser?.is_online ? "Active Now" : "Offline"}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => router.push("/call/audio")}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
              ]}
            >
              <Phone size={18} color="#FFFFFF" />
            </Pressable>
            <Pressable
              onPress={() => router.push("/call/video")}
              style={({ pressed }) => [
                styles.iconBtn,
                pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
              ]}
            >
              <Video size={18} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messageScroll}
          contentContainerStyle={styles.messageScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.dateLabelWrap}>
            <View style={styles.dateLabelInner}>
              <Text style={styles.dateLabelText}>TODAY</Text>
            </View>
          </View>

          {messagesList.map(renderBubble)}

          {messagesList.length === 0 && (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>
                You matched with {otherUser?.name}! Send the first message to
                kick off the connection.
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <Pressable
            onPress={() => setShowAttachmentSheet(true)}
            style={({ pressed }) => [
              styles.plusBtn,
              pressed && { backgroundColor: "rgba(255,255,255,0.1)" },
            ]}
          >
            <Plus size={20} color="#7C5CFF" />
          </Pressable>

          <View style={styles.inputWrap}>
            <TextInput
              placeholder="Type your message..."
              placeholderTextColor="#9A8FB8"
              value={text}
              onChangeText={setText}
              style={styles.input}
              multiline
            />
            <Pressable
              onPress={() =>
                Alert.alert("Voice Recording", "Voice messages coming soon!")
              }
            >
              <Mic size={18} color="#9A8FB8" />
            </Pressable>
          </View>

          <Pressable
            onPress={handleSend}
            disabled={!text.trim()}
            style={[
              styles.sendBtn,
              text.trim() ? styles.sendBtnActive : styles.sendBtnInactive,
            ]}
          >
            <Send
              size={16}
              color="#FFFFFF"
              fill={text.trim() ? "#FFFFFF" : "none"}
            />
          </Pressable>
        </View>

        {/* Attachment Modal */}
        <Modal
          visible={showAttachmentSheet}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setShowAttachmentSheet(false)}
        >
          <Pressable
            onPress={() => setShowAttachmentSheet(false)}
            style={styles.modalOverlay}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalSheet}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Share Attachment</Text>
                <Pressable
                  onPress={() => setShowAttachmentSheet(false)}
                  style={styles.modalCloseBtn}
                >
                  <X size={16} color="#FFFFFF" />
                </Pressable>
              </View>

              <View style={styles.attachmentGrid}>
                {attachmentOptions.map((item) => (
                  <Pressable
                    key={item.label}
                    onPress={() => handleAttachmentOption(item.label)}
                    style={({ pressed }) => [
                      styles.attachmentItem,
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <View
                      style={[
                        styles.attachmentIcon,
                        {
                          backgroundColor: item.bg,
                          borderColor: item.border,
                          borderWidth: 1,
                        },
                      ]}
                    >
                      <item.icon size={22} color={item.color} />
                    </View>
                    <Text style={styles.attachmentLabel}>{item.label}</Text>
                  </Pressable>
                ))}
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0E0720",
  },
  flex1: { flex: 1 },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(26, 15, 61, 0.4)",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.05)",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarWrap: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    backgroundColor: "#1B1035",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  avatar: { width: 40, height: 40, borderRadius: 20 },
  avatarPlaceholderText: { color: "#FFFFFF", fontFamily: "Inter_400Regular" },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    borderWidth: 2,
    borderColor: "#0E0720",
  },
  headerName: {
    color: "#FFFFFF",
    fontFamily: "Inter_700Bold",
    fontSize: 15,
    fontWeight: "bold",
  },
  headerStatus: {
    color: "#9A8FB8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#1B1035",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },

  // Messages
  messageScroll: { flex: 1, paddingHorizontal: 16 },
  messageScrollContent: { paddingVertical: 16 },
  dateLabelWrap: { alignItems: "center", marginVertical: 16 },
  dateLabelInner: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(27, 16, 53, 0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  dateLabelText: {
    color: "#9A8FB8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
  },
  emptyWrap: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyText: {
    color: "#9A8FB8",
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 24,
  },

  // Bubble
  bubbleRow: { flexDirection: "row", marginBottom: 14 },
  bubbleRowMe: { justifyContent: "flex-end" },
  bubbleRowThem: { justifyContent: "flex-start" },
  bubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
  },
  bubbleMe: {
    backgroundColor: "#7C5CFF",
    borderTopRightRadius: 4,
  },
  bubbleThem: {
    backgroundColor: "#1B1035",
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  bubbleText: {
    color: "#FFFFFF",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    lineHeight: 20,
  },
  bubbleTime: {
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
    textAlign: "right",
    color: "rgba(154, 143, 184, 0.7)",
  },

  // Input
  inputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(26, 15, 61, 0.2)",
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  plusBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1B1035",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  inputWrap: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1035",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  input: {
    color: "#FFFFFF",
    fontFamily: "Inter_400Regular",
    fontSize: 15,
    flex: 1,
    padding: 0,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnActive: { backgroundColor: "#7C5CFF" },
  sendBtnInactive: {
    backgroundColor: "#1B1035",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    opacity: 0.5,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  modalSheet: {
    backgroundColor: "#0E0720",
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    color: "#FFFFFF",
    fontFamily: "SpaceGrotesk_700Bold",
    fontSize: 18,
    fontWeight: "bold",
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1B1035",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  attachmentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  attachmentItem: { width: "30%", alignItems: "center", marginBottom: 24 },
  attachmentIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  attachmentLabel: {
    color: "#9A8FB8",
    fontFamily: "Inter_500Medium",
    fontSize: 12,
    textAlign: "center",
  },
});
