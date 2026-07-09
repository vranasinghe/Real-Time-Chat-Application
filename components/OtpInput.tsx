import React, { useRef, useState } from "react";
import { View, TextInput, NativeSyntheticEvent, TextInputKeyPressEventData } from "react-native";

interface OtpInputProps {
  codeLength?: number;
  onCodeChanged?: (code: string) => void;
}

export function OtpInput({ codeLength = 4, onCodeChanged }: OtpInputProps) {
  const [code, setCode] = useState<string[]>(Array(codeLength).fill(""));
  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChangeText = (text: string, index: number) => {
    const cleanText = text.replace(/[^0-9]/g, "");
    if (!cleanText) return;

    const newCode = [...code];
    // Take the last character typed
    newCode[index] = cleanText.slice(-1);
    setCode(newCode);

    const fullCode = newCode.join("");
    if (onCodeChanged) {
      onCodeChanged(fullCode);
    }

    // Auto-focus next input
    if (index < codeLength - 1 && newCode[index] !== "") {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace") {
      const newCode = [...code];
      if (newCode[index] !== "") {
        newCode[index] = "";
        setCode(newCode);
        if (onCodeChanged) onCodeChanged(newCode.join(""));
      } else if (index > 0) {
        newCode[index - 1] = "";
        setCode(newCode);
        inputs.current[index - 1]?.focus();
        if (onCodeChanged) onCodeChanged(newCode.join(""));
      }
    }
  };

  return (
    <View className="flex-row justify-center space-x-4 w-full my-4">
      {Array(codeLength)
        .fill(0)
        .map((_, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputs.current[index] = ref;
            }}
            className="w-14 h-16 bg-bg-surface border border-text-secondary/15 focus:border-primary text-white font-sans text-2xl font-bold text-center rounded-2xl"
            keyboardType="number-pad"
            maxLength={1}
            value={code[index]}
            onChangeText={(text) => handleChangeText(text, index)}
            onKeyPress={(e) => handleKeyPress(e, index)}
            selectTextOnFocus
          />
        ))}
    </View>
  );
}
