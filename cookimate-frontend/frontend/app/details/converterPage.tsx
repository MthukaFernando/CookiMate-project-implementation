import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  Modal,
  FlatList,
  StatusBar,
  ScrollView,
} from "react-native";

const { width } = Dimensions.get("window");

// --- DARK MODE BRANDING ---
const BRAND = {
  bg: "#0A0A0A", // Deep Midnight
  surface: "#1E1E1E", // Elevated Grey
  accent: "#D4AF37", // Vibrant Amber/Gold
  textMain: "#FFFFFF",
  textMuted: "#A0A0A0",
  inputBg: "#2A2A2A",
  border: "#333333",
};

const UNIT_OPTIONS: any = {
  Weight: ["lb", "kg", "g", "oz"],
  Volume: ["Cup", "ml", "L", "tbsp", "tsp"],
  Temperature: ["°F", "°C", "K"],
  Baking: ["oz", "g", "mg"],
};

export default function ConverterPage() {
  const [conversionType, setConversionType] = useState<string | null>(null);
  const [unitLeft, setUnitLeft] = useState("");
  const [unitRight, setUnitRight] = useState("");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");
  const [showPicker, setShowPicker] = useState<{
    side: "left" | "right";
  } | null>(null);

  useEffect(() => {
    if (conversionType) {
      const defaults = UNIT_OPTIONS[conversionType];
      setUnitLeft(defaults[0]);
      setUnitRight(defaults[1]);
      setInput1("");
      setInput2("");
    }
  }, [conversionType]);

  const convert = (val: number, from: string, to: string) => {
    let baseValue = val;
    if (from === "lb") baseValue = val * 0.453592;
    if (from === "g") baseValue = val / 1000;
    if (from === "oz") baseValue = val * 0.0283495;
    if (from === "Cup") baseValue = val * 236.588;
    if (from === "L") baseValue = val * 1000;
    if (from === "tbsp") baseValue = val * 14.7868;
    if (from === "tsp") baseValue = val * 4.92892;
    if (from === "°F") baseValue = (val - 32) * (5 / 9);
    if (from === "K") baseValue = val - 273.15;

    let result = baseValue;
    if (to === "lb") result = baseValue / 0.453592;
    if (to === "g") result = baseValue * 1000;
    if (to === "oz") result = baseValue / 0.0283495;
    if (to === "Cup") result = baseValue / 236.588;
    if (to === "L") result = baseValue / 1000;
    if (to === "tbsp") result = baseValue / 14.7868;
    if (to === "tsp") result = baseValue / 4.92892;
    if (to === "°F") result = (baseValue * 9) / 5 + 32;
    if (to === "K") result = baseValue + 273.15;

    return isNaN(result) ? "" : result.toFixed(2);
  };

  const handleTextChange = (value: string, isLeft: boolean) => {
    const cleanValue = value.replace(/[^0-9.]/g, "");
    if (cleanValue === "") {
      isLeft ? setInput1("") : setInput2("");
      isLeft ? setInput2("") : setInput1("");
      return;
    }
    if (isLeft) {
      setInput1(cleanValue);
      setInput2(convert(parseFloat(cleanValue), unitLeft, unitRight));
    } else {
      setInput2(cleanValue);
      setInput1(convert(parseFloat(cleanValue), unitRight, unitLeft));
    }
  };

  const categories = [
    { id: "Weight", icon: "scale-outline" },
    { id: "Volume", icon: "beaker-outline" },
    { id: "Temperature", icon: "thermometer-outline" },
    { id: "Baking", icon: "restaurant-outline" },
  ];

  return (
    <View style={styles.outerContainer}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          <View style={styles.content}>
            {!conversionType ? (
              <View style={styles.gridContainer}>
                <Text style={styles.sectionLabel}>CHOOSE CATEGORY</Text>

                <View style={styles.grid}>
                  {categories.map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.menuCard}
                      activeOpacity={0.7}
                      onPress={() => setConversionType(item.id)}
                    >
                      <View style={styles.iconCircle}>
                        <Ionicons
                          name={item.icon as any}
                          size={32}
                          color={BRAND.accent}
                        />
                      </View>
                      <Text style={styles.cardLabel}>
                        {item.id.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ) : (
              <View style={styles.converterCard}>
                <TouchableOpacity
                  style={styles.backLink}
                  onPress={() => setConversionType(null)}
                >
                  <Ionicons name="arrow-back" size={20} color={BRAND.accent} />
                  <Text style={styles.backText}>CATEGORIES</Text>
                </TouchableOpacity>

                <Text style={styles.activeCategory}>{conversionType}</Text>

                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.mainInput}
                    value={input1}
                    onChangeText={(t) => handleTextChange(t, true)}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={BRAND.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.unitPickerBtn}
                    onPress={() => setShowPicker({ side: "left" })}
                  >
                    <Text style={styles.unitBtnText}>{unitLeft}</Text>
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={BRAND.accent}
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.swapContainer}>
                  <View style={styles.swapLine} />
                  <View style={styles.swapCircle}>
                    <Ionicons name="swap-vertical" size={22} color={BRAND.bg} />
                  </View>
                  <View style={styles.swapLine} />
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    { borderColor: BRAND.accent, borderBottomWidth: 2 },
                  ]}
                >
                  <TextInput
                    style={styles.mainInput}
                    value={input2}
                    onChangeText={(t) => handleTextChange(t, false)}
                    keyboardType="numeric"
                    placeholder="0.00"
                    placeholderTextColor={BRAND.textMuted}
                  />
                  <TouchableOpacity
                    style={styles.unitPickerBtn}
                    onPress={() => setShowPicker({ side: "right" })}
                  >
                    <Text style={styles.unitBtnText}>{unitRight}</Text>
                    <Ionicons
                      name="chevron-down"
                      size={14}
                      color={BRAND.accent}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        <Modal visible={!!showPicker} transparent animationType="slide">
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowPicker(null)}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHandle} />
              <FlatList
                data={conversionType ? UNIT_OPTIONS[conversionType] : []}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      showPicker?.side === "left"
                        ? setUnitLeft(item)
                        : setUnitRight(item);
                      setShowPicker(null);
                      setInput1("");
                      setInput2("");
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: { flex: 1, backgroundColor: BRAND.bg },
  container: { flex: 1, backgroundColor: BRAND.bg },
  scrollContent: {
    flexGrow: 1,
  },
  content: { flex: 1, padding: 25, justifyContent: "center" },
  gridContainer: { width: "100%" },
  sectionLabel: {
    fontSize: 12,
    color: BRAND.textMuted,
    fontWeight: "900",
    letterSpacing: 3,
    marginBottom: 30,
    textAlign: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  menuCard: {
    backgroundColor: BRAND.surface,
    width: "48%",
    height: 140,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 15,
    borderWidth: 1,
    borderColor: BRAND.border,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: BRAND.inputBg,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    color: BRAND.textMain,
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
  },
  converterCard: {
    backgroundColor: BRAND.surface,
    borderRadius: 30,
    padding: 25,
    borderWidth: 1,
    borderColor: BRAND.border,
  },
  backLink: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backText: {
    color: BRAND.accent,
    fontSize: 12,
    fontWeight: "900",
    marginLeft: 5,
  },
  activeCategory: {
    fontSize: 36,
    fontWeight: "900",
    color: BRAND.textMain,
    marginBottom: 30,
  },
  inputWrapper: {
    backgroundColor: BRAND.inputBg,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 85,
  },
  mainInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "bold",
    color: BRAND.textMain,
  },
  unitPickerBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BRAND.bg,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  unitBtnText: { color: BRAND.textMain, fontWeight: "900", marginRight: 5 },
  swapContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 15,
    justifyContent: "center",
  },
  swapLine: {
    flex: 1,
    height: 1,
    backgroundColor: BRAND.border,
    marginHorizontal: 15,
  },
  swapCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BRAND.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: BRAND.surface,
    width: "100%",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    paddingBottom: 40,
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: BRAND.border,
    alignSelf: "center",
    borderRadius: 2,
    marginBottom: 20,
  },
  modalItem: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: BRAND.border,
  },
  modalItemText: {
    color: BRAND.textMain,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "bold",
  },
});