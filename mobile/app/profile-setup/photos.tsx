import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, Image, Alert } from "react-native";
import { router } from "expo-router";
import { Camera, Plus, Trash2 } from "lucide-react-native";
import { useAppStore } from "@/lib/store";
import { PrimaryButton, GhostButton } from "@/components/PrimaryButton";

const MOCK_GALLERY = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=600&auto=format&fit=crop&q=80"
];

export default function PhotosSetupScreen() {
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handlePhotoClick = (index: number) => {
    // If photo exists in this slot, delete it
    if (uploadedPhotos[index]) {
      const newPhotos = [...uploadedPhotos];
      newPhotos.splice(index, 1);
      setUploadedPhotos(newPhotos);
    } else {
      // Simulate photo pick from device, load one from the mock gallery
      const nextMockPhoto = MOCK_GALLERY[uploadedPhotos.length];
      if (nextMockPhoto) {
        setUploadedPhotos([...uploadedPhotos, nextMockPhoto]);
      } else {
        // Fallback random portrait if they try to upload more
        setUploadedPhotos([...uploadedPhotos, "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80"]);
      }
    }
  };

  const handleNext = () => {
    if (uploadedPhotos.length < 4) {
      Alert.alert(
        "Upload Photos",
        `Please upload at least 4 photos to verify your profile. Currently uploaded: ${uploadedPhotos.length}/4.`,
        [
          { text: "Add More", style: "cancel" },
          { text: "Skip Anyway", onPress: () => saveAndContinue() }
        ]
      );
      return;
    }
    saveAndContinue();
  };

  const saveAndContinue = () => {
    // Fill up to 4 if empty for demo purposes
    const finalPhotos = uploadedPhotos.length > 0 ? uploadedPhotos : MOCK_GALLERY;

    useAppStore.setState((state) => {
      if (state.user) {
        return { user: { ...state.user, photos: finalPhotos } };
      }
      return {};
    });
    router.push("/profile-setup/language");
  };

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "space-between" }} className="px-6 py-6">
        <View className="w-full">
          
          {/* Header */}
          <View className="mt-8 mb-8">
            <Text className="text-white text-3xl font-bold font-display tracking-tight mb-2">
              Be yourself!
            </Text>
            <Text className="text-text-secondary text-base font-sans leading-6">
              Upload at least 4 photos to show matches the real you. Tap any box to pick or remove a photo.
            </Text>
          </View>

          {/* Photo Upload Grid */}
          <View className="w-full flex-row flex-wrap mb-4">
            
            {/* Slot 0 (Large Main Slot) */}
            <View className="w-full aspect-[4/3] p-1.5 mb-2">
              <Pressable
                onPress={() => handlePhotoClick(0)}
                className="w-full h-full rounded-3xl border border-dashed border-white/10 bg-bg-surface overflow-hidden items-center justify-center relative active:opacity-90"
              >
                {uploadedPhotos[0] ? (
                  <>
                    <Image source={{ uri: uploadedPhotos[0] }} className="w-full h-full object-cover" />
                    <View className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-like/90 items-center justify-center">
                      <Trash2 size={16} color="#FFFFFF" />
                    </View>
                  </>
                ) : (
                  <View className="items-center px-6">
                    <Camera size={36} color="#7C5CFF" strokeWidth={1.5} />
                    <Text className="text-white font-sans font-bold text-base text-center mt-3">
                      Upload Profile Cover
                    </Text>
                    <Text className="text-text-secondary font-sans text-[12px] text-center mt-1">
                      Click to upload or drag & drop
                    </Text>
                  </View>
                )}
              </Pressable>
            </View>

            {/* Thumbnail Slots 1, 2, 3 */}
            <View className="w-full flex-row">
              {[1, 2, 3].map((slotIdx) => (
                <View key={slotIdx} className="flex-1 aspect-square p-1.5">
                  <Pressable
                    onPress={() => handlePhotoClick(slotIdx)}
                    className="w-full h-full rounded-2xl border border-dashed border-white/10 bg-bg-surface overflow-hidden items-center justify-center relative active:opacity-90"
                  >
                    {uploadedPhotos[slotIdx] ? (
                      <>
                        <Image source={{ uri: uploadedPhotos[slotIdx] }} className="w-full h-full object-cover" />
                        <View className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-like/90 items-center justify-center">
                          <Trash2 size={12} color="#FFFFFF" />
                        </View>
                      </>
                    ) : (
                      <View className="items-center">
                        <Plus size={20} color="#9A8FB8" />
                        <Text className="text-text-secondary font-sans text-[11px] mt-1">
                          Slot {slotIdx + 1}
                        </Text>
                      </View>
                    )}
                  </Pressable>
                </View>
              ))}
            </View>

          </View>
        </View>

        {/* Actions */}
        <View className="w-full space-y-3.5 pb-4 mt-8">
          <PrimaryButton
            label={uploadedPhotos.length >= 4 ? "Save & Continue" : `Next (${uploadedPhotos.length}/4)`}
            onPress={handleNext}
          />
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
