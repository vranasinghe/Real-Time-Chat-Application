import React, { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import * as WebBrowser from "expo-web-browser";

export default function AuthCallback() {
  useEffect(() => {
    // Complete the auth session redirect inside the browser popup
    WebBrowser.maybeCompleteAuthSession();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0E0720" }}>
      <ActivityIndicator size="large" color="#C535FF" />
    </View>
  );
}
