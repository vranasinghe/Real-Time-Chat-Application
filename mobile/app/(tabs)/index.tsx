import React, { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  SafeAreaView,
  Pressable,
  ScrollView,
  Image,
  Alert,
  StyleSheet,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import {
  Bell,
  Search,
  Plus, 
  Trash2, 
  X, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Sparkles,
  Camera
} from "lucide-react-native";
import { useAppStore, Profile, Story } from "@/lib/store";
import { SwipeDeck } from "@/components/SwipeDeck";
import { WebView } from "react-native-webview";
import * as ImagePicker from "expo-image-picker";

const { width: SW } = Dimensions.get("window");

const getVideoHtml = (url: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      background-color: black;
      overflow: hidden;
      display: flex;
      justify-content: center;
      align-items: center;
    }
    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  </style>
</head>
<body>
  <video src="${url}" autoplay loop playsinline webkit-playsinline muted></video>
</body>
</html>
`;

const PRESET_PHOTOS = [
  { id: "p1", name: "Classic", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80" },
  { id: "p2", name: "Casual", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80" },
  { id: "p3", name: "Vibrant", url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80" },
  { id: "p4", name: "Sunset", url: "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80" },
];

const PRESET_VIDEOS = [
  { id: "v1", name: "Sparkle", url: "https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-sparkler-at-night-42289-large.mp4" },
  { id: "v2", name: "Ocean", url: "https://assets.mixkit.co/videos/preview/mixkit-waves-crashing-on-rocks-from-above-41968-large.mp4" },
  { id: "v3", name: "Neon", url: "https://assets.mixkit.co/videos/preview/mixkit-neon-light-from-a-building-at-night-41584-large.mp4" },
  { id: "v4", name: "Raindrops", url: "https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-a-window-at-night-41616-large.mp4" },
];

export default function DiscoveryScreen() {
  const { 
    user, 
    profiles, 
    swipes, 
    recordSwipe, 
    activeMatch, 
    resetSwipes, 
    fetchDiscoveryProfiles, 
    createQuickMatch,
    stories,
    addStory,
    deleteStory 
  } = useAppStore();

  const [unreadNotifications, setUnreadNotifications] = useState(true);
  const [icebreakerModalVisible, setIcebreakerModalVisible] = useState(false);
  const [icebreakerText, setIcebreakerText] = useState("");
  const [selectedProfileForIcebreaker, setSelectedProfileForIcebreaker] = useState<Profile | null>(null);

  const [addStoryModalVisible, setAddStoryModalVisible] = useState(false);
  const [viewStoryModalVisible, setViewStoryModalVisible] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [customMediaUrl, setCustomMediaUrl] = useState("");
  const [customMediaType, setCustomMediaType] = useState<"image" | "video">("image");
  const [uploading, setUploading] = useState(false);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  const [selectedStories, setSelectedStories] = useState<Story[]>([]);

  const myStories = stories.filter((s) => s.user_id === user?.id);

  // Group other users' stories by user_id
  const otherStoriesGrouped = useMemo(() => {
    const groups: { [userId: string]: Story[] } = {};
    stories.forEach((s) => {
      if (s.user_id !== user?.id) {
        if (!groups[s.user_id]) {
          groups[s.user_id] = [];
        }
        groups[s.user_id].push(s);
      }
    });
    return groups;
  }, [stories, user?.id]);



  useEffect(() => {
    fetchDiscoveryProfiles();
  }, [user?.id]);

  useEffect(() => {
    if (activeMatch) {
      router.push("/matched");
    }
  }, [activeMatch]);

  const handleNextStory = () => {
    if (currentStoryIndex < selectedStories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setStoryProgress(0);
    } else {
      setViewStoryModalVisible(false);
    }
  };

  const handlePrevStory = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setStoryProgress(0);
    }
  };


  useEffect(() => {
    let interval: any;
    if (viewStoryModalVisible && selectedStories.length > 0) {
      interval = setInterval(() => {
        if (!isTimerPaused) {
          setStoryProgress((prev) => {
            if (prev >= 1) {
              handleNextStory();
              return 0;
            }
            return prev + 0.02; // ~5 seconds (50 increments * 100ms)
          });
        }
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [viewStoryModalVisible, currentStoryIndex, selectedStories.length, isTimerPaused]);

  const handleMyStoryPress = () => {
    if (myStories.length > 0) {
      setSelectedStories(myStories);
      setCurrentStoryIndex(0);
      setStoryProgress(0);
      setViewStoryModalVisible(true);
    } else {
      setAddStoryModalVisible(true);
    }
  };

  const handleOtherStoryPress = (userClips: Story[]) => {
    setSelectedStories(userClips);
    setCurrentStoryIndex(0);
    setStoryProgress(0);
    setViewStoryModalVisible(true);
  };

  const pickMedia = async (mediaType: "image" | "video") => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        Alert.alert("Permission Required", "Permission to access camera roll is required to upload stories.");
        return;
      }

      setUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: mediaType === "image" ? ImagePicker.MediaTypeOptions.Images : ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [9, 16],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedUri = result.assets[0].uri;
        await addStory(selectedUri, mediaType);
        setAddStoryModalVisible(false);
        Alert.alert("Success 🎉", "Your story has been added successfully!");
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Upload Failed", "An error occurred while uploading your story.");
    } finally {
      setUploading(false);
    }
  };

  const handlePresetSelect = async (url: string, type: "image" | "video") => {
    setUploading(true);
    try {
      await addStory(url, type);
      setAddStoryModalVisible(false);
      Alert.alert("Success 🎉", "Preset story added successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleCustomUrlSubmit = async () => {
    if (!customMediaUrl.trim()) return;
    setUploading(true);
    try {
      await addStory(customMediaUrl.trim(), customMediaType);
      setCustomMediaUrl("");
      setAddStoryModalVisible(false);
      Alert.alert("Success 🎉", "Custom story added successfully!");
    } catch (e) {
      console.error(e);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteCurrentStory = async () => {
    const storyToDelete = selectedStories[currentStoryIndex];
    if (storyToDelete) {
      setIsTimerPaused(true);
      Alert.alert("Delete Story", "Are you sure you want to delete this story?", [
        { 
          text: "Cancel", 
          style: "cancel",
          onPress: () => setIsTimerPaused(false)
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await deleteStory(storyToDelete.id);
            setIsTimerPaused(false);
            const updatedSelected = selectedStories.filter((s) => s.id !== storyToDelete.id);
            setSelectedStories(updatedSelected);
            if (updatedSelected.length === 0) {
              setViewStoryModalVisible(false);
            } else {
              if (currentStoryIndex >= updatedSelected.length) {
                setCurrentStoryIndex(updatedSelected.length - 1);
              }
              setStoryProgress(0);
            }
          },
        },
      ]);
    }
  };

  const feedProfiles = profiles.filter((p) => {
    const hasSwiped = swipes.some((s) => s.swipee_id === p.id);
    return !hasSwiped && p.id !== user?.id;
  });

  const handleSwipe = async (
    profile: Profile,
    direction: "like" | "pass" | "super"
  ) => {
    await recordSwipe(profile.id, direction);
  };

  const handleMessagePress = (profile: Profile) => {
    setSelectedProfileForIcebreaker(profile);
    setIcebreakerText("");
    setIcebreakerModalVisible(true);
  };

  const handleSendIcebreaker = async () => {
    if (!selectedProfileForIcebreaker) return;
    
    const messageToSend = icebreakerText.trim();
    setIcebreakerModalVisible(false);
    
    // Swipe the profile as like, sending the icebreaker message note
    await recordSwipe(selectedProfileForIcebreaker.id, "like", messageToSend || undefined);
    
    Alert.alert(
      "Icebreaker Sent! 💌",
      `Your message has been sent to ${selectedProfileForIcebreaker.name}. If they like you back, your conversation will appear in Chats!`,
      [{ text: "OK" }]
    );
    
    setSelectedProfileForIcebreaker(null);
    setIcebreakerText("");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* ── Header ── */}
        <View style={styles.header}>
          {/* Brand Logo left side */}
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={{ color: "#FFFFFF", fontSize: 26, fontWeight: "bold", fontFamily: "Outfit-Bold" }}>
              Dateza
            </Text>
          </View>

          {/* Bell right side */}
          <Pressable
            onPress={() => {
              setUnreadNotifications(false);
              router.push("/notifications");
            }}
            style={styles.bellBtn}
          >
            <Bell size={20} color="#FFFFFF" strokeWidth={1.8} />
            {unreadNotifications && <View style={styles.bellDot} />}
          </Pressable>
        </View>

        {/* ── Search bar ── */}
        <Pressable
          onPress={() => router.push("/search")}
          style={styles.searchBar}
        >
          <Search size={17} color="#9A8FB8" />
          <Text style={styles.searchText}>Search</Text>
        </Pressable>

        {/* ── Stories row ── */}
        <View style={styles.storiesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={Platform.OS === "web"} contentContainerStyle={{ alignItems: "center" }}>
            <Pressable
              onPress={handleMyStoryPress}
              style={[styles.storyItem, { marginRight: 16 }]}
            >
              <View style={styles.storyAvatarWrap}>
                {/* Ring */}
                <View
                  style={[
                    styles.storyRing,
                    myStories.length > 0
                      ? styles.storyRingActive
                      : styles.storyRingDashed,
                  ]}
                >
                  <Image
                    source={{ uri: (user?.photos && user.photos.length > 0) ? user.photos[0] : "https://i.pravatar.cc/150?img=47" }}
                    style={styles.storyAvatar}
                  />
                </View>

                {/* Plus badge */}
                <Pressable
                  onPress={() => setAddStoryModalVisible(true)}
                  style={styles.plusBadge}
                >
                  <Plus size={10} color="#fff" strokeWidth={3} />
                </Pressable>
              </View>

              <Text style={styles.storyName}>My Story</Text>
            </Pressable>

            {/* Other Members' Stories */}
            {Object.keys(otherStoriesGrouped).map((userId) => {
              const userClips = otherStoriesGrouped[userId];
              const firstClip = userClips[0];
              return (
                <Pressable
                  key={userId}
                  onPress={() => handleOtherStoryPress(userClips)}
                  style={[styles.storyItem, { marginRight: 16 }]}
                >
                  <View style={styles.storyAvatarWrap}>
                    <View style={[styles.storyRing, styles.storyRingActive]}>
                      <Image
                        source={{ uri: firstClip.user_avatar }}
                        style={styles.storyAvatar}
                      />
                    </View>
                  </View>
                  <Text style={styles.storyName} numberOfLines={1} ellipsizeMode="tail">
                    {firstClip.user_name.split(" ")[0]}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* ── SwipeDeck ── */}
        <View style={styles.deckWrapper}>
          <SwipeDeck
            profiles={feedProfiles}
            onSwipe={handleSwipe}
            onMessagePress={handleMessagePress}
            onReset={resetSwipes}
          />
        </View>

        {/* Icebreaker Modal */}
        <Modal
          visible={icebreakerModalVisible}
          animationType="fade"
          transparent={true}
          onRequestClose={() => setIcebreakerModalVisible(false)}
        >
          <Pressable
            onPress={() => setIcebreakerModalVisible(false)}
            style={styles.modalOverlay}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <Text style={styles.modalTitle}>
                Send Icebreaker to {selectedProfileForIcebreaker?.name} 💌
              </Text>
              <Text style={styles.modalSubtitle}>
                Add a personal note to increase your chances of matching!
              </Text>

              <TextInput
                style={styles.modalInput}
                placeholder="Type your message..."
                placeholderTextColor="#9A8FB8"
                multiline
                numberOfLines={4}
                value={icebreakerText}
                onChangeText={setIcebreakerText}
                maxLength={200}
              />
              <Text style={styles.charCount}>
                {icebreakerText.length}/200
              </Text>

              <View style={styles.modalButtons}>
                <Pressable
                  onPress={() => setIcebreakerModalVisible(false)}
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                >
                  <Text style={styles.modalBtnTextCancel}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={handleSendIcebreaker}
                  style={[styles.modalBtn, styles.modalSendBtn]}
                >
                  <Text style={styles.modalBtnTextSend}>Send Note</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>

        {/* Add Story Modal */}
        <Modal
          visible={addStoryModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setAddStoryModalVisible(false)}
        >
          <Pressable
            onPress={() => setAddStoryModalVisible(false)}
            style={styles.modalOverlay}
          >
            <Pressable
              onPress={(e) => e.stopPropagation()}
              style={[styles.modalContent, styles.addStoryModalContent]}
            >
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitleLeft}>Add My Story</Text>
                <Pressable onPress={() => setAddStoryModalVisible(false)} style={styles.modalCloseBtn}>
                  <X size={20} color="#9A8FB8" />
                </Pressable>
              </View>
              
              <Text style={styles.modalDesc}>
                Upload a portrait photo or looping video clip to share with other users for 24 hours.
              </Text>

              {/* Upload source options */}
              <Text style={styles.sectionLabel}>Camera Roll</Text>
              <View style={styles.pickerRow}>
                <Pressable
                  onPress={() => pickMedia("image")}
                  style={[styles.pickerBtn, { backgroundColor: "rgba(124,92,255,0.12)", borderColor: "rgba(124,92,255,0.3)" }]}
                >
                  <Camera size={20} color="#7C5CFF" />
                  <Text style={styles.pickerBtnText}>Add Photo</Text>
                </Pressable>
                <Pressable
                  onPress={() => pickMedia("video")}
                  style={[styles.pickerBtn, { backgroundColor: "rgba(236,72,153,0.12)", borderColor: "rgba(236,72,153,0.3)" }]}
                >
                  <VideoIcon size={20} color="#EC4899" />
                  <Text style={[styles.pickerBtnText, { color: "#EC4899" }]}>Add Video</Text>
                </Pressable>
              </View>

              {/* Presets section */}
              <View style={{ flexDirection: "row", alignItems: "center", marginTop: 18, marginBottom: 8 }}>
                <Sparkles size={14} color="#7C5CFF" style={{ marginRight: 6 }} />
                <Text style={styles.sectionLabelNoMargin}>Test with Premium Presets</Text>
              </View>

              <Text style={styles.presetsLabel}>Photos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
                {PRESET_PHOTOS.map((preset) => (
                  <Pressable
                    key={preset.id}
                    onPress={() => handlePresetSelect(preset.url, "image")}
                    style={styles.presetThumbWrap}
                  >
                    <Image source={{ uri: preset.url }} style={styles.presetThumb} />
                    <Text style={styles.presetThumbLabel}>{preset.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              <Text style={styles.presetsLabel}>Videos</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsScroll}>
                {PRESET_VIDEOS.map((preset) => (
                  <Pressable
                    key={preset.id}
                    onPress={() => handlePresetSelect(preset.url, "video")}
                    style={styles.presetThumbWrap}
                  >
                    <View style={styles.presetThumbVideoFallback}>
                      <VideoIcon size={18} color="#9A8FB8" />
                    </View>
                    <Text style={styles.presetThumbLabel}>{preset.name}</Text>
                  </Pressable>
                ))}
              </ScrollView>

              {/* URL upload section */}
              <Text style={[styles.sectionLabel, { marginTop: 18 }]}>Upload via Media URL</Text>
              <TextInput
                style={styles.urlInput}
                placeholder="Paste direct .jpg, .png, or .mp4 link..."
                placeholderTextColor="#6F648A"
                value={customMediaUrl}
                onChangeText={setCustomMediaUrl}
              />
              
              <View style={styles.urlTypeRow}>
                <Pressable
                  onPress={() => setCustomMediaType("image")}
                  style={[
                    styles.typeSelectBtn,
                    customMediaType === "image" && styles.typeSelectBtnActive,
                  ]}
                >
                  <Text style={[styles.typeSelectBtnText, customMediaType === "image" && styles.typeSelectBtnTextActive]}>Image</Text>
                </Pressable>
                <Pressable
                  onPress={() => setCustomMediaType("video")}
                  style={[
                    styles.typeSelectBtn,
                    customMediaType === "video" && styles.typeSelectBtnActive,
                  ]}
                >
                  <Text style={[styles.typeSelectBtnText, customMediaType === "video" && styles.typeSelectBtnTextActive]}>Video</Text>
                </Pressable>
              </View>

              <Pressable
                onPress={handleCustomUrlSubmit}
                style={[styles.modalBtn, styles.modalSendBtn, { width: "100%", height: 46, marginTop: 12 }]}
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.modalBtnTextSend}>Add Story Link</Text>
                )}
              </Pressable>

            </Pressable>
          </Pressable>
        </Modal>

        {/* View Story Modal */}
        <Modal
          visible={viewStoryModalVisible}
          animationType="fade"
          transparent={false}
          onRequestClose={() => setViewStoryModalVisible(false)}
        >
          <SafeAreaView style={styles.storyViewerContainer}>
            {selectedStories.length > 0 && currentStoryIndex < selectedStories.length ? (
              <View style={{ flex: 1 }}>
                
                {/* Media Element */}
                {selectedStories[currentStoryIndex].media_type === "video" ? (
                  <WebView
                    source={{ html: getVideoHtml(selectedStories[currentStoryIndex].media_url) }}
                    style={styles.storyViewerMedia}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    scalesPageToFit={true}
                  />
                ) : (
                  <Image
                    source={{ uri: selectedStories[currentStoryIndex].media_url }}
                    style={styles.storyViewerMedia}
                    resizeMode="cover"
                  />
                )}

                {/* Left/Right Touch navigation areas */}
                <View style={styles.touchNavWrapper}>
                  <Pressable onPress={handlePrevStory} style={styles.touchNavLeft} />
                  <Pressable onPress={handleNextStory} style={styles.touchNavRight} />
                </View>

                {/* Top overlay controls */}
                <View style={styles.storyViewerHeaderArea}>
                  
                  {/* Progress Bars */}
                  <View style={styles.progressBarsRow}>
                    {selectedStories.map((item, idx) => {
                      let widthPct = "0%";
                      if (idx < currentStoryIndex) {
                        widthPct = "100%";
                      } else if (idx === currentStoryIndex) {
                        widthPct = `${storyProgress * 100}%`;
                      }
                      return (
                        <View key={item.id} style={styles.progressBarTrack}>
                          <View style={[styles.progressBarFill, { width: widthPct as any }]} />
                        </View>
                      );
                    })}
                  </View>

                  {/* Profile info & action row */}
                  <View style={styles.storyHeaderProfileRow}>
                    <Image source={{ uri: selectedStories[currentStoryIndex].user_avatar }} style={styles.storyHeaderAvatar} />
                    <View style={styles.storyHeaderProfileText}>
                      <Text style={styles.storyHeaderName}>{selectedStories[currentStoryIndex].user_name}</Text>
                      <Text style={styles.storyHeaderTime}>
                        {(() => {
                          const diff = Date.now() - new Date(selectedStories[currentStoryIndex].created_at).getTime();
                          const hrs = Math.floor(diff / (1000 * 60 * 60));
                          if (hrs < 1) {
                            const mins = Math.floor(diff / (1000 * 60));
                            return `${mins}m ago`;
                          }
                          return `${hrs}h ago`;
                        })()}
                      </Text>
                    </View>
                    
                    {/* Delete button (only show for self stories) */}
                    {selectedStories[currentStoryIndex].user_id === user?.id && (
                      <Pressable onPress={handleDeleteCurrentStory} style={styles.storyActionBtn}>
                        <Trash2 size={18} color="#FF4B4B" />
                      </Pressable>
                    )}

                    {/* Close button */}
                    <Pressable onPress={() => setViewStoryModalVisible(false)} style={[styles.storyActionBtn, { marginLeft: 10 }]}>
                      <X size={20} color="#FFFFFF" />
                    </Pressable>
                  </View>
                </View>

              </View>
            ) : null}
          </SafeAreaView>
        </Modal>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0E0720",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  /* Header */
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#1B1035",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF2E6E",
    borderWidth: 1.5,
    borderColor: "#0E0720",
  },

  /* Search */
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1B1035",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 13,
    marginBottom: 16,
  },
  searchText: {
    color: "#9A8FB8",
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    marginLeft: 12,
  },

  /* Stories Container */
  storiesContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 4,
  },
  storyItem: {
    alignItems: "center",
  },
  storyAvatarWrap: {
    position: "relative",
    marginBottom: 4,
  },
  storyRing: {
    width: 62,
    height: 62,
    borderRadius: 31,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  storyRingDashed: {
    borderWidth: 1.5,
    borderColor: "rgba(154,143,184,0.45)",
    borderStyle: "dashed",
  },
  storyRingActive: {
    borderWidth: 2,
    borderColor: "#7C5CFF",
  },
  storyAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  plusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#7C5CFF",
    borderWidth: 2,
    borderColor: "#0E0720",
    alignItems: "center",
    justifyContent: "center",
  },
  storyName: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    marginTop: 2,
  },
  storiesTextContainer: {
    marginLeft: 16,
    flex: 1,
    justifyContent: "center",
  },
  storyStatusTitle: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  storyStatusSub: {
    color: "#9A8FB8",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },

  /* Add Story Modal Specifics */
  addStoryModalContent: {
    maxHeight: "85%",
    paddingBottom: 30,
  },
  modalHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  modalTitleLeft: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "Inter_700Bold",
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalDesc: {
    color: "#9A8FB8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    lineHeight: 18,
    marginBottom: 16,
  },
  sectionLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    marginBottom: 8,
  },
  sectionLabelNoMargin: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  pickerRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 14,
  },
  pickerBtn: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  pickerBtnText: {
    color: "#7C5CFF",
    fontSize: 13,
    fontFamily: "Inter_600SemiBold",
  },
  presetsLabel: {
    color: "#9A8FB8",
    fontSize: 11,
    fontFamily: "Inter_500Medium",
    textTransform: "uppercase",
    marginBottom: 6,
  },
  presetsScroll: {
    flexGrow: 0,
    marginBottom: 10,
  },
  presetThumbWrap: {
    marginRight: 10,
    alignItems: "center",
  },
  presetThumb: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#0E0720",
  },
  presetThumbVideoFallback: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#1F153F",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  presetThumbLabel: {
    color: "#9A8FB8",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 4,
  },
  urlInput: {
    backgroundColor: "#0E0720",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 10,
  },
  urlTypeRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  typeSelectBtn: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
  typeSelectBtnActive: {
    backgroundColor: "#7C5CFF",
    borderColor: "#7C5CFF",
  },
  typeSelectBtnText: {
    color: "#9A8FB8",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  typeSelectBtnTextActive: {
    color: "#FFFFFF",
  },

  /* Story Viewer Container */
  storyViewerContainer: {
    flex: 1,
    backgroundColor: "#000000",
  },
  storyViewerMedia: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  touchNavWrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    zIndex: 1,
  },
  touchNavLeft: {
    flex: 3,
    height: "100%",
  },
  touchNavRight: {
    flex: 7,
    height: "100%",
  },
  storyViewerHeaderArea: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 25,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    zIndex: 2,
  },
  progressBarsRow: {
    flexDirection: "row",
    gap: 4,
    marginBottom: 12,
  },
  progressBarTrack: {
    flex: 1,
    height: 3,
    backgroundColor: "rgba(255,255,255,0.25)",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
  },
  storyHeaderProfileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  storyHeaderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  storyHeaderProfileText: {
    marginLeft: 10,
    flex: 1,
  },
  storyHeaderName: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  storyHeaderTime: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    marginTop: 1,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  storyActionBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  /* Deck */
  deckWrapper: {
    flex: 1,
    // Tab bar is absolute: bottom:20, height:68 → needs 100px clearance
    paddingBottom: 100,
  },

  /* Icebreaker Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#1B1035",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  modalTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontFamily: "Inter_700Bold",
    marginBottom: 8,
    textAlign: "center",
  },
  modalSubtitle: {
    color: "#9A8FB8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
    marginBottom: 18,
    textAlign: "center",
    lineHeight: 18,
  },
  modalInput: {
    width: "100%",
    backgroundColor: "#0E0720",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    padding: 16,
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlignVertical: "top",
    minHeight: 100,
  },
  charCount: {
    color: "#9A8FB8",
    fontSize: 11,
    fontFamily: "Inter_400Regular",
    textAlign: "right",
    marginTop: 6,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  modalCancelBtn: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  modalSendBtn: {
    backgroundColor: "#7C5CFF",
  },
  modalBtnTextCancel: {
    color: "#9A8FB8",
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  modalBtnTextSend: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Inter_700Bold",
  },
});
