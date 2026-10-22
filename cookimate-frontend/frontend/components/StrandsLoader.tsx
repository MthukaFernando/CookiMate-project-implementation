import React, { useMemo } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { WebView } from "react-native-webview";
import { buildStrandsHtml, StrandsConfig } from "./strandsHtml";

interface StrandsLoaderProps extends StrandsConfig {
  size?: number;
  style?: ViewStyle;
  onReady?: () => void;
}

export default function StrandsLoader({
  size = 160,
  style,
  onReady,
  ...config
}: StrandsLoaderProps) {
  const html = useMemo(() => buildStrandsHtml(config), [JSON.stringify(config)]);

  return (
    <View style={[styles.wrapper, { width: size, height: size }, style]}>
      <WebView
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        backgroundColor="transparent"
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        pointerEvents="none"
        androidLayerType="hardware"
        onMessage={() => onReady?.()}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});