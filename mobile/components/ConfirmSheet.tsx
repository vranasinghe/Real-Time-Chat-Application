import React from "react";
import { View, Text, Modal, Pressable } from "react-native";
import { PrimaryButton, GhostButton } from "./PrimaryButton";

interface ConfirmSheetProps {
  visible: boolean;
  title: string;
  description: string;
  actionLabel: string;
  cancelLabel?: string;
  onAction: () => void;
  onCancel: () => void;
}

export function ConfirmSheet({
  visible,
  title,
  description,
  actionLabel,
  cancelLabel = "Cancel",
  onAction,
  onCancel,
}: ConfirmSheetProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Pressable
        onPress={onCancel}
        className="flex-1 bg-black/60 justify-end p-6"
      >
        <Pressable className="bg-bg-surface border border-white/10 rounded-3xl p-6 w-full max-h-[400px]">
          <Text className="text-white font-sans text-xl font-bold text-center mb-2">
            {title}
          </Text>
          <Text className="text-text-secondary font-sans text-[15px] text-center mb-6 leading-5">
            {description}
          </Text>
          <View className="flex-col gap-3" style={{ gap: 12 }}>
            <PrimaryButton label={actionLabel} onPress={onAction} />
            <GhostButton label={cancelLabel} onPress={onCancel} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
