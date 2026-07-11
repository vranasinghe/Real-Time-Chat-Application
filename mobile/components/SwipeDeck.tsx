import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  Pressable,
  Alert,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import { X, Heart, MessageSquare, MoreVertical } from "lucide-react-native";
import { Profile } from "@/lib/store";

const { width: SW, height: SH } = Dimensions.get("window");

// Card dimensions: width = screen - padding, height = available after header/stories/actions/tabbar
const CARD_W = SW - 32; // 16px left + 16px right padding
// SH - SafeArea top (~50) - header(52) - search(56) - stories(82) - actionRow(78) - tabBar(100) - extra(20)
const CARD_H = Math.min(CARD_W * 1.28, SH - 438);
const SWIPE_THRESHOLD = SW * 0.38;

interface SwipeDeckProps {
  profiles: Profile[];
  onSwipe: (profile: Profile, direction: "like" | "pass" | "super") => void;
  onMessagePress: (profile: Profile) => void;
  onReset?: () => void;
}

export function SwipeDeck({ profiles, onSwipe, onMessagePress, onReset }: SwipeDeckProps) {
  const activeProfiles = profiles.slice(0, 3);

  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onStart(() => {
      startX.value = tx.value;
      startY.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = startX.value + e.translationX;
      ty.value = startY.value + e.translationY;
    })
    .onEnd((e) => {
      const vx = e.velocityX;
      const dx = tx.value;

      if (dx > SWIPE_THRESHOLD || vx > 900) {
        tx.value = withSpring(SW * 1.6, { velocity: vx }, () => {
          runOnJS(onSwipe)(profiles[0], "like");
        });
      } else if (dx < -SWIPE_THRESHOLD || vx < -900) {
        tx.value = withSpring(-SW * 1.6, { velocity: vx }, () => {
          runOnJS(onSwipe)(profiles[0], "pass");
        });
      } else {
        tx.value = withSpring(0, { damping: 15 });
        ty.value = withSpring(0, { damping: 15 });
      }
    });

  React.useEffect(() => {
    tx.value = withSpring(0);
    ty.value = withSpring(0);
  }, [profiles[0]?.id]);

  const triggerRight = () => {
    if (!profiles.length) return;
    tx.value = withTiming(SW * 1.6, { duration: 320 }, () => {
      runOnJS(onSwipe)(profiles[0], "like");
    });
  };

  const triggerLeft = () => {
    if (!profiles.length) return;
    tx.value = withTiming(-SW * 1.6, { duration: 320 }, () => {
      runOnJS(onSwipe)(profiles[0], "pass");
    });
  };

  const topCardAnim = useAnimatedStyle(() => {
    const rotate = interpolate(tx.value, [-SW / 2, 0, SW / 2], [-12, 0, 12]);
    return {
      transform: [
        { translateX: tx.value },
        { translateY: ty.value },
        { rotate: `${rotate}deg` },
      ],
    };
  });

  const likeStampAnim = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [0, SW * 0.22], [0, 1], "clamp"),
  }));

  const nopeStampAnim = useAnimatedStyle(() => ({
    opacity: interpolate(tx.value, [-SW * 0.22, 0], [1, 0], "clamp"),
  }));

  /* ── Empty state ── */
  if (profiles.length === 0) {
    return (
      <View style={styles.empty}>
        <View style={styles.emptyIconWrap}>
          <Heart size={32} color="#9A8FB8" />
        </View>
        <Text style={styles.emptyTitle}>That's Everyone!</Text>
        <Text style={styles.emptyBody}>
          You've seen all profiles nearby. Check back later or start over!
        </Text>
        {onReset && (
          <Pressable onPress={onReset} style={styles.resetBtn}>
            <Text style={styles.resetBtnTxt}>🔄  Start Over</Text>
          </Pressable>
        )}
      </View>
    );
  }

  /* ── Main deck ── */
  return (
    <View style={styles.root}>

      {/* Card stack */}
      <View style={styles.deckArea}>
        {activeProfiles.map((profile, index) => {
          const isTop = index === 0;
          const age =
            new Date().getFullYear() -
            new Date(profile.birthdate).getFullYear();

          /* Background cards */
          if (!isTop) {
            const scale = 1 - index * 0.04;
            const vert = -(index * 10); // stack slightly upward
            return (
              <View
                key={profile.id}
                style={[
                  styles.card,
                  {
                    zIndex: 20 - index,
                    transform: [{ scale }, { translateY: vert }],
                    opacity: 1 - index * 0.12,
                  },
                ]}
              >
                {profile.photos[0] ? (
                  <Image
                    source={{ uri: profile.photos[0] }}
                    style={styles.cardPhoto}
                  />
                ) : (
                  <View style={styles.noPhoto}>
                    <View style={styles.noPhotoIcon}>
                      <Text style={styles.noPhotoIconText}>🖼</Text>
                    </View>
                    <Text style={styles.noPhotoText}>No Image Preview</Text>
                  </View>
                )}
              </View>
            );
          }

          /* Top (interactive) card */
          return (
            <GestureDetector key={profile.id} gesture={pan}>
              <Animated.View style={[styles.card, { zIndex: 30 }, topCardAnim]}>

                {/* Photo or placeholder */}
                {profile.photos[0] ? (
                  <Image
                    source={{ uri: profile.photos[0] }}
                    style={styles.cardPhoto}
                  />
                ) : (
                  <View style={styles.noPhoto}>
                    <View style={styles.noPhotoIcon}>
                      <Text style={styles.noPhotoIconText}>🖼</Text>
                    </View>
                    <Text style={styles.noPhotoText}>No Image Preview</Text>
                  </View>
                )}

                {/* LIKE stamp */}
                <Animated.View style={[styles.likeStamp, likeStampAnim]}>
                  <Text style={styles.likeStampTxt}>LIKE</Text>
                </Animated.View>

                {/* NOPE stamp */}
                <Animated.View style={[styles.nopeStamp, nopeStampAnim]}>
                  <Text style={styles.nopeStampTxt}>NOPE</Text>
                </Animated.View>

                {/* Top-left badges */}
                <View style={styles.badgesRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeTxt}>{profile.match_percent}% Match</Text>
                  </View>
                </View>

                {/* Top-right three-dot */}
                <Pressable
                  onPress={() =>
                    Alert.alert("Options", "Report or Share this profile.")
                  }
                  style={styles.moreBtn}
                  hitSlop={12}
                >
                  <MoreVertical size={18} color="#FFFFFF" />
                </Pressable>

                {/* Bottom info overlay */}
                <View style={styles.infoOverlay}>
                  {profile.swipe_message && (
                    <View style={styles.swipeNoteBubble}>
                      <Text style={styles.swipeNoteLabel}>Intro Note 💌</Text>
                      <Text style={styles.swipeNoteText} numberOfLines={2}>
                        "{profile.swipe_message}"
                      </Text>
                    </View>
                  )}

                  {/* Online Now chip */}
                  <View style={styles.onlineChip}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineTxt}>Online Now</Text>
                  </View>

                  <Text style={styles.profileName}>
                    {profile.name} - {age}
                  </Text>

                  <Text style={styles.profileBio} numberOfLines={2}>
                    {profile.bio}
                  </Text>

                  <Pressable
                    onPress={() =>
                      Alert.alert(
                        "Profile",
                        `Opening ${profile.name}'s full profile.`
                      )
                    }
                    style={styles.viewProfileBtn}
                  >
                    <Text style={styles.viewProfileTxt}>View Full Profile</Text>
                  </Pressable>
                </View>

              </Animated.View>
            </GestureDetector>
          );
        })}
      </View>

      {/* Action buttons row */}
      <View style={styles.actionRow}>
        {/* Pass */}
        <Pressable onPress={triggerLeft} style={styles.passBtn}>
          <X size={24} color="#9A8FB8" strokeWidth={2.5} />
        </Pressable>

        {/* Like FAB */}
        <Pressable onPress={triggerRight} style={styles.likeBtn}>
          <Heart size={30} color="#FFFFFF" fill="#FFFFFF" />
        </Pressable>

        {/* Message */}
        <Pressable
          onPress={() => onMessagePress(profiles[0])}
          style={styles.msgBtn}
        >
          <MessageSquare size={22} color="#7C5CFF" strokeWidth={2} />
        </Pressable>
      </View>

    </View>
  );
}

/* ───────────── Styles ───────────── */
const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingBottom: 8,
  },

  /* ── Deck ── */
  deckArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    position: "absolute",
    width: CARD_W,
    height: CARD_H,
    borderRadius: 26,
    overflow: "hidden",
    backgroundColor: "#1B1035",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 22,
    elevation: 14,
  },
  cardPhoto: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  /* ── No-photo placeholder ── */
  noPhoto: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#2A2044",
  },
  noPhotoIcon: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: "#1B1035",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  noPhotoIconText: { fontSize: 28 },
  noPhotoText: {
    color: "#9A8FB8",
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },

  /* ── Stamps ── */
  likeStamp: {
    position: "absolute",
    top: 44,
    left: 22,
    borderWidth: 3.5,
    borderColor: "#22C55E",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 5,
    transform: [{ rotate: "-12deg" }],
  },
  likeStampTxt: {
    color: "#22C55E",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },
  nopeStamp: {
    position: "absolute",
    top: 44,
    right: 22,
    borderWidth: 3.5,
    borderColor: "#FF2E6E",
    borderRadius: 9,
    paddingHorizontal: 12,
    paddingVertical: 5,
    transform: [{ rotate: "12deg" }],
  },
  nopeStampTxt: {
    color: "#FF2E6E",
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    letterSpacing: 3,
  },

  /* ── Badges ── */
  badgesRow: {
    position: "absolute",
    top: 18,
    left: 18,
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    backgroundColor: "rgba(14,7,32,0.70)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeTxt: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  /* ── Three-dot ── */
  moreBtn: {
    position: "absolute",
    top: 16,
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(0,0,0,0.30)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    alignItems: "center",
    justifyContent: "center",
  },

  /* ── Info overlay ── */
  infoOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 52,
    backgroundColor: "rgba(10,5,28,0.68)",
  },
  onlineChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(34,197,94,0.18)",
    borderWidth: 1,
    borderColor: "rgba(34,197,94,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22C55E",
    marginRight: 5,
  },
  onlineTxt: {
    color: "#22C55E",
    fontSize: 10,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.6,
    textTransform: "uppercase",
  },
  profileName: {
    color: "#FFFFFF",
    fontSize: 26,
    fontFamily: "SpaceGrotesk_700Bold",
    fontStyle: "italic",
    marginBottom: 5,
    lineHeight: 30,
  },
  profileBio: {
    color: "rgba(255,255,255,0.65)",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    lineHeight: 17,
    marginBottom: 12,
  },
  viewProfileBtn: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.28)",
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  viewProfileTxt: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
  },

  /* ── Action row ── */
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    paddingVertical: 10,
    width: "100%",
  },
  passBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(27,16,53,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  likeBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#FF2E6E",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF2E6E",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 16,
    elevation: 12,
  },
  msgBtn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "rgba(27,16,53,0.95)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },

  /* ── Empty state ── */
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1B1035",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    fontFamily: "SpaceGrotesk_700Bold",
    textAlign: "center",
    marginBottom: 10,
  },
  emptyBody: {
    color: "#9A8FB8",
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 28,
  },
  resetBtn: {
    backgroundColor: "#7C5CFF",
    paddingHorizontal: 28,
    paddingVertical: 13,
    borderRadius: 999,
    shadowColor: "#7C5CFF",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 14,
    elevation: 8,
  },
  resetBtnTxt: {
    color: "#FFFFFF",
    fontSize: 15,
    fontFamily: "Inter_700Bold",
    letterSpacing: 0.3,
  },
  swipeNoteBubble: {
    backgroundColor: "rgba(124, 92, 255, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(124, 92, 255, 0.3)",
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
  },
  swipeNoteLabel: {
    color: "#7C5CFF",
    fontSize: 11,
    fontFamily: "Inter_700Bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  swipeNoteText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_400Regular",
    fontStyle: "italic",
    lineHeight: 16,
  },
});
