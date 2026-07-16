import React, { useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Image,
  StyleSheet,
  StatusBar,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withDelay,
  withSequence,
} from "react-native-reanimated";
import { ArrowLeft, Image as ImageIcon, Heart } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Defs, ClipPath, Path, Image as SvgImage } from "react-native-svg";
import { Platform, ScrollView } from "react-native";


const { width: SW } = Dimensions.get("window");

// Sub-component to render a premium heart-shaped profile card
function HeartCard({ photoUrl }: { photoUrl?: string }) {
  return (
    <View style={styles.heartCardContainer}>
      <Svg width="180" height="180" viewBox="0 0 100 100">
        <Defs>
          <ClipPath id="heart-clip">
            <Path d="M 50 15 C 35 1 1 15 1 50 C 1 75 25 88 50 95 C 75 88 99 75 99 50 C 99 15 65 1 50 15 Z" />
          </ClipPath>
        </Defs>
        {/* Glow/Border behind heart */}
        <Path
          d="M 50 15 C 35 1 1 15 1 50 C 1 75 25 88 50 95 C 75 88 99 75 99 50 C 99 15 65 1 50 15 Z"
          fill="#FFFFFF"
          stroke="#7C5CFF"
          strokeWidth="3.5"
        />
        {photoUrl && (
          <SvgImage
            href={photoUrl}
            width="100"
            height="100"
            preserveAspectRatio="xMidYMid slice"
            clipPath="url(#heart-clip)"
          />
        )}
      </Svg>
      {!photoUrl && (
        <View style={styles.heartPlaceholder}>
          <ImageIcon size={30} color="#B3B0C2" />
          <Text style={styles.heartPlaceholderText}>No Image Preview</Text>
        </View>
      )}
    </View>
  );
}

export default function MatchedScreen() {
  const { user, activeMatch, clearActiveMatch } = useAppStore();
  const insets = useSafeAreaInsets();

  const card1Scale = useSharedValue(0);
  const card1Rotate = useSharedValue(0);
  const card2Scale = useSharedValue(0);
  const card2Rotate = useSharedValue(0);
  const heartScale = useSharedValue(0);

  useEffect(() => {
    // Spring entry animations matching premium dating app feel
    card1Scale.value = withSpring(1, { damping: 11 });
    card1Rotate.value = withSpring(-12, { damping: 10 });

    card2Scale.value = withDelay(
      300,
      withSpring(1, { damping: 11 }, () => {
        heartScale.value = withSequence(
          withSpring(1.3, { damping: 5 }),
          withSpring(1, { damping: 8 })
        );
      })
    );
    card2Rotate.value = withDelay(300, withSpring(12, { damping: 10 }));
  }, []);

  const card1Style = useAnimatedStyle(() => ({
    transform: [
      { scale: card1Scale.value },
      { rotate: `${card1Rotate.value}deg` },
    ],
  }));

  const card2Style = useAnimatedStyle(() => ({
    transform: [
      { scale: card2Scale.value },
      { rotate: `${card2Rotate.value}deg` },
    ],
  }));

  if (!activeMatch) {
    return null;
  }

  const otherName = activeMatch.profile.name || "User";
  const matchPercent = activeMatch.profile.match_percent || 90;

  const handleChatPress = () => {
    const matchId = activeMatch.match.id;
    clearActiveMatch();
    router.replace({
      pathname: "/chat-thread",
      params: { matchId },
    });
  };

  const handleGoBack = () => {
    clearActiveMatch();
    try {
      router.replace("/(tabs)");
    } catch {
      router.replace("/(tabs)/explore");
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top || StatusBar.currentHeight || 0 }]}>
      
      {/* Background glowing gradients */}
      <View style={styles.glowBg} />

      {/* Header Row */}
      <View style={styles.header}>
        <Pressable
          onPress={handleGoBack}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={({ pressed }) => [
            styles.backBtn,
            pressed && { opacity: 0.5 },
          ]}
        >
          <ArrowLeft size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle}>Matched</Text>
        <View style={styles.headerRightPlaceholder} />
      </View>

      {/* Main Content Scrollable for safety */}
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        style={styles.contentWrap}
        scrollEnabled={Platform.OS === 'web'}
        showsVerticalScrollIndicator={false}
      >
        
        {/* Floating/Falling Hearts Background */}
        <View style={[styles.floatingHeart, { top: "8%", left: "10%" }]}>
          <Heart size={44} color="#EF4444" fill="#EF4444" style={{ transform: [{ rotate: "-15deg" }] }} />
        </View>
        <View style={[styles.floatingHeart, { top: "4%", left: "42%" }]}>
          <Heart size={28} color="#EF4444" fill="#EF4444" />
        </View>
        <View style={[styles.floatingHeart, { top: "6%", right: "20%" }]}>
          <Heart size={18} color="#EF4444" fill="#EF4444" style={{ transform: [{ rotate: "10deg" }] }} />
        </View>
        <View style={[styles.floatingHeart, { top: "20%", right: "8%" }]}>
          <Heart size={36} color="#EF4444" fill="#EF4444" style={{ transform: [{ rotate: "25deg" }] }} />
        </View>
        <View style={[styles.floatingHeart, { bottom: "46%", left: "12%", opacity: 0.35 }]}>
          <Heart size={32} color="#EF4444" fill="#EF4444" style={{ transform: [{ rotate: "-20deg" }] }} />
        </View>
        <View style={[styles.floatingHeart, { bottom: "45%", left: "54%" }]}>
          <Heart size={30} color="#EF4444" fill="#EF4444" style={{ transform: [{ rotate: "5deg" }] }} />
        </View>

        {/* Celebratory overlapping heart cards */}
        <View style={styles.deckWrapper}>
          
          {/* User Card */}
          <Animated.View style={[card1Style, styles.cardLeft]}>
            <HeartCard photoUrl={user?.photos?.[0]} />
          </Animated.View>

          {/* Match Partner Card */}
          <Animated.View style={[card2Style, styles.cardRight]}>
            <HeartCard photoUrl={activeMatch.profile.photos?.[0]} />
          </Animated.View>

        </View>

        {/* Text Details */}
        <View style={styles.textDetails}>
          <Text style={styles.matchPercentText}>{matchPercent}%</Text>
          <Text style={styles.matchTitleText}>You Got The Match</Text>
          <Text style={styles.matchSubText}>
            You And {otherName} Have 24 Hours To Make The First Move
          </Text>
        </View>

        {/* Lets Chat Button */}
        <Pressable
          onPress={handleChatPress}
          style={({ pressed }) => [
            styles.chatBtn,
            pressed && { opacity: 0.85, transform: [{ scale: 0.98 }] },
          ]}
        >
          <Text style={styles.chatBtnText}>Lets Chat</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0E0720",
  },
  glowBg: {
    position: "absolute",
    top: -100,
    alignSelf: "center",
    width: SW * 1.5,
    height: SW * 1.2,
    borderRadius: 999,
    backgroundColor: "rgba(124, 92, 255, 0.08)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontFamily: "SpaceGrotesk_700Bold",
    fontWeight: "bold",
  },
  headerRightPlaceholder: {
    width: 40,
  },
  contentWrap: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 40,
    position: "relative",
  },
  floatingHeart: {
    position: "absolute",
    zIndex: 1,
  },
  deckWrapper: {
    height: 240,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    marginVertical: 20,
  },
  cardLeft: {
    position: "absolute",
    left: "14%",
    zIndex: 10,
  },
  cardRight: {
    position: "absolute",
    right: "14%",
    zIndex: 9,
  },
  heartCardContainer: {
    width: 180,
    height: 180,
    position: "relative",
  },
  heartPlaceholder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 10,
  },
  heartPlaceholderText: {
    color: "#8E8A9E",
    fontSize: 10,
    fontFamily: "Inter_400Regular",
    marginTop: 6,
    textAlign: "center",
  },
  textDetails: {
    alignItems: "center",
    marginVertical: 20,
  },
  matchPercentText: {
    fontSize: 64,
    fontFamily: "SpaceGrotesk_700Bold",
    fontWeight: "bold",
    color: "#E2D9FF",
    textAlign: "center",
    marginBottom: 6,
  },
  matchTitleText: {
    fontSize: 26,
    fontFamily: "SpaceGrotesk_700Bold",
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 8,
  },
  matchSubText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    color: "#9A8FB8",
    textAlign: "center",
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  chatBtn: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    backgroundColor: "#7C5CFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#7C5CFF",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  chatBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_700Bold",
    fontWeight: "bold",
  },
});
