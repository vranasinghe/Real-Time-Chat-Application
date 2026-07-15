import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { io } from "socket.io-client";
import type { Socket } from "socket.io-client";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";

import { Platform } from "react-native";

let BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "http://localhost:3000";
if (Platform.OS === "android" && BACKEND_URL.includes("localhost")) {
  BACKEND_URL = BACKEND_URL.replace("localhost", "10.0.2.2");
}

// Global WebSocket reference
let socketConnection: Socket | null = null;

export interface Profile {
  id: string;
  email?: string;
  name: string;
  birthdate: string;
  gender: string;
  looking_for: string;
  bio: string;
  height_cm: number;
  interests: string[];
  photos: string[];
  lat?: number;
  lng?: number;
  is_online: boolean;
  match_percent?: number;
  swipe_message?: string;
}

export interface Swipe {
  id: string;
  swiper_id: string;
  swipee_id: string;
  direction: "like" | "pass" | "super";
  created_at: string;
}

export interface Match {
  id: string;
  user_a: string;
  user_b: string;
  created_at: string;
  expires_at: string;
  other_user?: Profile; // Populated dynamically
}

export interface Message {
  id: string;
  match_id: string;
  sender_id: string;
  body: string;
  kind: "text" | "image" | "location";
  created_at: string;
}

export interface Story {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  media_url: string;
  media_type: "image" | "video";
  created_at: string;
}

interface AppState {
  // Auth & Session
  user: Profile | null;
  session: boolean;
  token: string | null;
  profileSetupComplete: boolean;
  isUsingSupabase: boolean; // Acts as "live database enabled" flag for backward compatibility

  // App Data
  profiles: Profile[];
  likesYou: Profile[];
  swipes: Swipe[];
  matches: Match[];
  messages: Message[];
  stories: Story[];

  // Interactive Flow States
  activeMatch: { match: Match; profile: Profile } | null;

  // Actions
  initializeStore: () => Promise<void>;
  fetchDiscoveryProfiles: () => Promise<void>;
  fetchMatches: () => Promise<void>;
  fetchLikesYou: () => Promise<void>;
  checkSupabaseConnection: () => boolean;
  signIn: (email: string, pass: string) => Promise<boolean>;
  signUp: (email: string, pass: string, name: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  completeSetup: (profileData: Partial<Profile>) => Promise<void>;
  signOut: () => Promise<void>;
  createQuickMatch: (profile: Profile) => Promise<{ success: boolean; error?: string }>;

  // Swipe Actions
  recordSwipe: (swipeeId: string, direction: "like" | "pass" | "super", message?: string) => Promise<void>;
  clearActiveMatch: () => void;
  resetSwipes: () => void;

  // Chat Actions
  sendMessage: (matchId: string, body: string, kind?: "text" | "image" | "location") => Promise<void>;
  receiveMessage: (message: Message) => void;
  loadMessagesForMatch: (matchId: string) => Message[];
  getSocketConnection: () => Socket | null;

  // Story Actions
  addStory: (mediaUrl: string, mediaType: "image" | "video") => Promise<void>;
  deleteStory: (storyId: string) => Promise<void>;
}



export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      session: false,
      token: null,
      profileSetupComplete: false,
      isUsingSupabase: false,
      profiles: [],
      likesYou: [],
      swipes: [],
      matches: [],
      messages: [],
      stories: [
        {
          id: "story-mock-liana-1",
          user_id: "seed-liana",
          user_name: "Liana Ray",
          user_avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
          media_url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=600&auto=format&fit=crop&q=80",
          media_type: "image",
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "story-mock-elena-1",
          user_id: "seed-elena",
          user_name: "Elena",
          user_avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80",
          media_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80",
          media_type: "image",
          created_at: new Date(Date.now() - 7200000).toISOString(),
        }
      ],
      activeMatch: null,

      initializeStore: async () => {
        WebBrowser.maybeCompleteAuthSession();
        const connected = get().checkSupabaseConnection();
        set({ isUsingSupabase: connected });

        if (connected && get().token) {
          // Initialize WebSockets client
          get().getSocketConnection();

          // Verify token session validity
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/me`, {
              headers: { Authorization: `Bearer ${get().token}` },
            });
            if (res.ok) {
              const profile = await res.json();
              set({
                user: profile,
                session: true,
                profileSetupComplete: !!profile.name && !!profile.birthdate,
              });
              await get().fetchMatches();
              await get().fetchLikesYou();
            } else {
              // Stale token, clear credentials
              await get().signOut();
            }
          } catch (e) {
            console.error("Session verification failed:", e);
          }
        }

        await get().fetchDiscoveryProfiles();
        await get().fetchLikesYou();
      },

      fetchDiscoveryProfiles: async () => {
        const { token, isUsingSupabase } = get();
        if (!token || !isUsingSupabase) {
          set({ profiles: [], swipes: [] });
          return;
        }

        try {
          const res = await fetch(`${BACKEND_URL}/api/profiles/discovery`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            set({ profiles: data as Profile[] });
          }
        } catch (e) {
          console.error("Failed to fetch discovery profiles from Express:", e);
          set({ profiles: [] });
        }
      },

      fetchLikesYou: async () => {
        const { token, isUsingSupabase } = get();
        if (!token || !isUsingSupabase) {
          set({ likesYou: [] });
          return;
        }

        try {
          const res = await fetch(`${BACKEND_URL}/api/profiles/likes-you`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = await res.json();
          if (res.ok) {
            set({ likesYou: data as Profile[] });
          }
        } catch (e) {
          console.error("Failed to fetch likes-you profiles from Express:", e);
        }
      },

      fetchMatches: async () => {
        const { token, isUsingSupabase } = get();
        if (!token || !isUsingSupabase) return;

        try {
          const res = await fetch(`${BACKEND_URL}/api/matches`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.ok) {
            const matchesData = await res.json();
            set({ matches: matchesData });

            // Fetch message thread logs for each match thread
            for (const match of matchesData) {
              const msgRes = await fetch(`${BACKEND_URL}/api/matches/${match.id}/messages`, {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (msgRes.ok) {
                const msgs = await msgRes.json();
                set((state) => {
                  const otherMsgs = state.messages.filter((m) => m.match_id !== match.id);
                  return { messages: [...otherMsgs, ...msgs] };
                });
              }
            }
          }
        } catch (e) {
          console.error("Failed to fetch matches:", e);
        }
      },

      checkSupabaseConnection: () => {
        // Returns true if backend URL environment is specified
        const url = process.env.EXPO_PUBLIC_BACKEND_URL;
        return !!url;
      },

      signIn: async (email, password) => {
        const isConnected = get().isUsingSupabase;
        if (isConnected) {
          const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          });

          let data: any = {};
          try {
            const text = await res.text();
            data = text ? JSON.parse(text) : {};
          } catch (jsonErr) {
            data = { error: `Server error (${res.status}). Please try again.` };
          }
          if (!res.ok) throw new Error(data.error || "Login failed");

          set({
            token: data.token,
            user: data.user,
            session: true,
            profileSetupComplete: !!data.user.name && !!data.user.birthdate,
          });

          // Connect WebSockets and load chat matches
          get().getSocketConnection();
          await get().fetchMatches();
          return true;
        }

        // Mock Sign-In Fallback
        const mockUser: Profile = {
          id: "current-user-mock-id",
          name: "Test User",
          birthdate: "1999-01-01",
          gender: "male",
          looking_for: "female",
          bio: "Just a default tester account.",
          height_cm: 180,
          interests: ["Tech", "Coffee", "Music"],
          photos: [],
          is_online: true,
        };

        set({
          user: mockUser,
          session: true,
          profileSetupComplete: true,
        });
        return true;
      },

      signUp: async (email, password, name) => {
        const isConnected = get().isUsingSupabase;
        if (isConnected) {
          const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, name }),
          });

          let data: any = {};
          try {
            const text = await res.text();
            data = text ? JSON.parse(text) : {};
          } catch (jsonErr) {
            data = { error: `Server error (${res.status}). Please try again.` };
          }
          if (!res.ok) throw new Error(data.error || "Signup failed");

          set({
            token: data.token,
            user: data.user,
            session: true,
            profileSetupComplete: false,
          });

          // Connect WebSockets
          get().getSocketConnection();
          return true;
        }

        // Mock Signup Fallback
        const newMockUser: Profile = {
          id: "current-user-mock-id",
          name: name,
          birthdate: "",
          gender: "",
          looking_for: "",
          bio: "",
          height_cm: 0,
          interests: [],
          photos: [],
          is_online: true,
        };

        set({
          user: newMockUser,
          session: true,
          profileSetupComplete: false,
        });
        return true;
      },

      signInWithGoogle: async () => {
        const isConnected = get().isUsingSupabase;
        if (!isConnected) {
          // Mock Sign-In Fallback for Google (Local development without backend)
          const mockGoogleUser: Profile = {
            id: "google-user-mock-id",
            email: "google-dev@example.com",
            name: "Google Developer",
            birthdate: "",
            gender: "",
            looking_for: "",
            bio: "",
            height_cm: 0,
            interests: [],
            photos: [],
            is_online: true,
          };
          set({
            user: mockGoogleUser,
            session: true,
            profileSetupComplete: false,
          });
          return true;
        }

        try {
          const redirectUrl = Linking.createURL("auth-callback");
          // Fetch Google OAuth Redirect URL from backend
          const res = await fetch(`${BACKEND_URL}/api/auth/google/url?redirect_uri=${encodeURIComponent(redirectUrl)}`);
          if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || "Failed to generate Google URL");
          }

          const { url } = await res.json();
          
          // Open web auth session
          const result = await WebBrowser.openAuthSessionAsync(url, redirectUrl);
          
          if (result.type === "success" && result.url) {
            const parsed = Linking.parse(result.url);
            const token = parsed.queryParams?.token;
            const userStr = parsed.queryParams?.user;

            if (token && userStr) {
              const userObj = JSON.parse(decodeURIComponent(userStr as string));
              set({
                token: token as string,
                user: userObj,
                session: true,
                profileSetupComplete: !!userObj.name && !!userObj.birthdate,
              });
              get().getSocketConnection();
              await get().fetchMatches();
              return true;
            }
          }
          return false;
        } catch (err) {
          console.error("Google login failed:", err);
          throw err;
        }
      },

      completeSetup: async (profileData) => {
        const { user, token, isUsingSupabase } = get();
        if (!user) return;

        const updatedUser = { ...user, ...profileData };

        if (isUsingSupabase && token) {
          try {
            const res = await fetch(`${BACKEND_URL}/api/auth/complete-setup`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(profileData),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Profile setup update failed");
            
            set({
              user: data.user,
              profileSetupComplete: true,
            });
          } catch (e) {
            console.error("Failed to sync setup wizard to backend:", e);
          }
        } else {
          set({
            user: updatedUser,
            profileSetupComplete: true,
          });
        }

        // Refetch discovery profiles matching new preference settings
        await get().fetchDiscoveryProfiles();
      },

      signOut: async () => {
        if (socketConnection) {
          socketConnection.disconnect();
          socketConnection = null;
        }
        set({
          user: null,
          session: false,
          token: null,
          profileSetupComplete: false,
          activeMatch: null,
          messages: [],
          matches: [],
          swipes: [],
        });
      },

      createQuickMatch: async (profile) => {
        const { user, token, isUsingSupabase } = get();
        if (!user) return { success: false, error: "Not signed in" };

        if (isUsingSupabase && token) {
          try {
            const res = await fetch(`${BACKEND_URL}/api/matches/quick`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ profile_id: profile.id }),
            });
            const data = await res.json();
            if (res.ok) {
              set((state) => {
                const matchExists = state.matches.some((m) => m.id === data.id);
                if (matchExists) return {};
                return { matches: [data, ...state.matches] };
              });
              // Connect socket to match room
              const socket = get().getSocketConnection();
              if (socket) {
                socket.emit("join_room", data.id);
              }
              return { success: true };
            }
            return { success: false, error: data.error || "Could not start a chat with this profile" };
          } catch (e) {
            console.error("Backend quick match creation failed", e);
            return { success: false, error: "Could not start a chat with this profile" };
          }
        } else {
          // Fallback to local memory mock match
          const newMatch: Match = {
            id: `match-quick-${Date.now()}`,
            user_a: user.id,
            user_b: profile.id,
            created_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 86400000).toISOString(),
            other_user: profile,
          };
          set((state) => {
            const matchExists = state.matches.some((m) => m.user_b === profile.id);
            if (matchExists) return {};
            return { matches: [newMatch, ...state.matches] };
          });
          return { success: true };
        }
      },

      recordSwipe: async (swipeeId, direction, message) => {
        const { user, token, isUsingSupabase, profiles } = get();
        if (!user) return;

        const newSwipe: Swipe = {
          id: Math.random().toString(),
          swiper_id: user.id,
          swipee_id: swipeeId,
          direction,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          swipes: [...state.swipes, newSwipe],
        }));

        if (isUsingSupabase && token) {
          try {
            const res = await fetch(`${BACKEND_URL}/api/swipes`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ swipee_id: swipeeId, direction, message }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Recording swipe failed");

            if (data.activeMatch) {
              set((state) => ({
                matches: [data.activeMatch.match, ...state.matches],
                activeMatch: data.activeMatch,
              }));
              // Connect socket to the match room
              const socket = get().getSocketConnection();
              if (socket) {
                socket.emit("join_room", data.activeMatch.match.id);
              }
            }
            await get().fetchDiscoveryProfiles();
            await get().fetchLikesYou();
          } catch (e) {
            console.error("Express swipe insert failure", e);
          }
        } else {
          // Mock Match Logic: 60% chance of a match if they "like" or "super" a mock profile
          if (direction === "like" || direction === "super") {
            const matches = get().matches;
            const alreadyMatched = matches.some((m) => m.user_b === swipeeId || m.user_a === swipeeId);
            if (alreadyMatched) return;

            const shouldMatch = Math.random() < 0.6;
            if (shouldMatch) {
              const matchedProfile = profiles.find((p) => p.id === swipeeId);
              if (matchedProfile) {
                const newMatch: Match = {
                  id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  user_a: user.id,
                  user_b: swipeeId,
                  created_at: new Date().toISOString(),
                  expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                  other_user: matchedProfile,
                };
                
                set((state) => ({
                  matches: [newMatch, ...state.matches],
                  activeMatch: { match: newMatch, profile: matchedProfile },
                }));
              }
            }
          }
        }
      },


      clearActiveMatch: () => set({ activeMatch: null }),

      resetSwipes: async () => {
        const { token, isUsingSupabase } = get();
        if (isUsingSupabase && token) {
          try {
            await fetch(`${BACKEND_URL}/api/swipes/reset`, {
              method: "POST",
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch (e) {
            console.error("Backend reset swipes failure", e);
          }
        }
        set({ swipes: [], activeMatch: null });
        await get().fetchDiscoveryProfiles();
      },

      sendMessage: async (matchId, body, kind = "text") => {
        const { user, token, isUsingSupabase } = get();
        if (!user) return;

        const newMsg: Message = {
          id: `msg-${Date.now()}-${Math.random()}`,
          match_id: matchId,
          sender_id: user.id,
          body,
          kind,
          created_at: new Date().toISOString(),
        };

        if (isUsingSupabase && token) {
          try {
            const res = await fetch(`${BACKEND_URL}/api/matches/${matchId}/messages`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ body, kind }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Send message failed");

            set((state) => {
              const exists = state.messages.some((m) => m.id === data.id);
              if (exists) {
                // Socket already inserted the message; just remove the temp message
                return { messages: state.messages.filter((m) => m.id !== newMsg.id) };
              }
              const otherMsgs = state.messages.filter((m) => m.id !== newMsg.id);
              return { messages: [...otherMsgs, data] };
            });
          } catch (e) {
            console.error("Express sendMessage failure", e);
          }
        } else {
          set((state) => ({
            messages: [...state.messages, newMsg],
          }));

          // Mock response: After 2 seconds, simulate the match typing and replying
          setTimeout(() => {
            const match = get().matches.find((m) => m.id === matchId);
            const partnerName = match?.other_user?.name || "Match";
            const replyMsg: Message = {
              id: `msg-reply-${Date.now()}`,
              match_id: matchId,
              sender_id: match?.user_b === user.id ? match.user_a : match?.user_b || "partner-id",
              body: `Hey! That sounds awesome. This is a simulated real-time response from ${partnerName}! ⚡`,
              kind: "text",
              created_at: new Date().toISOString(),
            };

            set((state) => ({
              messages: [...state.messages, replyMsg],
            }));
          }, 2500);
        }
      },

      receiveMessage: (message) => {
        set((state) => {
          // 1. If it already exists by ID, ignore it
          const exists = state.messages.some((m) => m.id === message.id);
          if (exists) return {};

          // 2. If it is sent by current user, look for matching temp message to replace
          if (state.user && message.sender_id === state.user.id) {
            const tempIndex = state.messages.findIndex(
              (m) => m.id.startsWith("msg-") && m.body === message.body
            );
            if (tempIndex !== -1) {
              const updated = [...state.messages];
              updated[tempIndex] = message;
              return { messages: updated };
            }
          }

          // 3. Otherwise, append to list
          return {
            messages: [...state.messages, message],
          };
        });
      },

      loadMessagesForMatch: (matchId) => {
        return get().messages.filter((m) => m.match_id === matchId);
      },

      getSocketConnection: () => {
        const { token, isUsingSupabase } = get();
        if (!token || !isUsingSupabase) {
          if (socketConnection) {
            socketConnection.disconnect();
            socketConnection = null;
          }
          return null;
        }

        let conn = socketConnection;
        if (!conn) {
          conn = io(BACKEND_URL, {
            auth: { token },
            extraHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
          socketConnection = conn;

          conn.on("connect", () => {
            console.log("Websocket connection successfully established.");
            
            // Join all active match rooms on reconnect
            const currentMatches = get().matches;
            currentMatches.forEach((match) => {
              conn?.emit("join_room", match.id);
            });
          });

          // Global real-time chat sync listener
          conn.on("new_message", (message: Message) => {
            set((state) => {
              const msgExists = state.messages.some((m) => m.id === message.id);
              if (msgExists) return {};
              return { messages: [...state.messages, message] };
            });
          });
        }

        return socketConnection;
      },

      addStory: async (mediaUrl: string, mediaType: "image" | "video") => {
        const { user } = get();
        if (!user) return;

        const newStory: Story = {
          id: `story-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
          user_id: user.id,
          user_name: user.name || "My Story",
          user_avatar: (user.photos && user.photos.length > 0) ? user.photos[0] : "https://i.pravatar.cc/150?img=47",
          media_url: mediaUrl,
          media_type: mediaType,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          stories: [newStory, ...state.stories],
        }));
      },

      deleteStory: async (storyId: string) => {
        set((state) => ({
          stories: state.stories.filter((s) => s.id !== storyId),
        }));
      },
    }),
    {
      name: "dateza-app-storage",
      storage: createJSONStorage(() => AsyncStorage),
      // Prevent trying to serialize the live socket connection reference
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        token: state.token,
        profileSetupComplete: state.profileSetupComplete,
        isUsingSupabase: state.isUsingSupabase,
        swipes: state.swipes,
        matches: state.matches,
        messages: state.messages,
        stories: state.stories,
      }),
    }
  )
);
