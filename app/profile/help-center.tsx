import React, { useState } from "react";
import { View, Text, SafeAreaView, Pressable, ScrollView, TextInput } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Search, ChevronDown, ChevronUp } from "lucide-react-native";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How do I reset my password?",
    answer: "To reset your password, go to Profile > Change Password, or use the 'Forgot Password' link on the Sign In screen."
  },
  {
    question: "How do I contact support?",
    answer: "You can reach our support team via the \"Contact Us\" option available in the app."
  },
  {
    question: "How can I update my information?",
    answer: "You can update your profile information, photos, and preferences under Profile > Edit Profile."
  },
  {
    question: "How do I report an issue?",
    answer: "Please reach out to support@dateza.com or fill out the feedback form in the settings to report any bugs."
  },
  {
    question: "How do I manage notifications?",
    answer: "Manage push notifications directly under Profile > Notifications."
  }
];

export default function HelpCenterScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    if (expandedIndex === index) {
      setExpandedIndex(null);
    } else {
      setExpandedIndex(index);
    }
  };

  const filteredFaqs = FAQS.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-bg-base">
      <View className="flex-1 px-6 py-6">
        
        {/* Navigation Header */}
        <View className="w-full flex-row items-center mb-6">
          <Pressable
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace("/(tabs)/profile");
              }
            }}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            className="py-2 pr-4 active:opacity-60"
          >
            <ArrowLeft size={24} color="#FFFFFF" />
          </Pressable>
          <Text className="text-white text-2xl font-bold font-display ml-2">
            Help Center
          </Text>
        </View>

        {/* Search Bar */}
        <View className="flex-row items-center bg-bg-surface/50 border border-white/5 px-4 py-3 rounded-2xl mb-6">
          <Search size={18} color="#9A8FB8" />
          <TextInput
            placeholder="Search..."
            placeholderTextColor="#6F648A"
            value={searchQuery}
            onChangeText={setSearchQuery}
            className="text-white font-sans text-[15px] ml-3 flex-1 p-0"
            autoCapitalize="none"
          />
        </View>

        {/* FAQ List */}
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {filteredFaqs.map((faq, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View
                key={index}
                className="bg-bg-surface/30 border border-white/5 rounded-2xl mb-3 overflow-hidden"
              >
                <Pressable
                  onPress={() => toggleExpand(index)}
                  className="flex-row justify-between items-center px-5 py-4 active:bg-bg-surface/60"
                >
                  <Text className="text-white font-sans font-semibold text-[15px] flex-1 pr-4">
                    {faq.question}
                  </Text>
                  {isExpanded ? (
                    <ChevronUp size={18} color="#9A8FB8" />
                  ) : (
                    <ChevronDown size={18} color="#9A8FB8" />
                  )}
                </Pressable>
                
                {isExpanded && (
                  <View className="px-5 pb-5 pt-1 border-t border-white/5 bg-[#1B1035]/20">
                    <Text className="text-text-secondary font-sans text-[13px] leading-5">
                      {faq.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}

          {filteredFaqs.length === 0 && (
            <View className="py-20 items-center justify-center">
              <Text className="text-text-secondary font-sans text-center">
                No matching help articles found.
              </Text>
            </View>
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
}
