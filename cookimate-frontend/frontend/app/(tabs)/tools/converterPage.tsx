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
} from "react-native";

const { width } = Dimensions.get("window");

// --- UNIT DATA ---
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

  // Set default units when a category is picked
  useEffect(() => {
    if (conversionType) {
      const defaults = UNIT_OPTIONS[conversionType];
      setUnitLeft(defaults[0]);
      setUnitRight(defaults[1]);
      setInput1("");
      setInput2("");
    }
  }, [conversionType]);

  // --- CONVERSION MATH ---
  const convert = (val: number, from: string, to: string) => {
    // Basic conversion to a "Base Unit" then to "Target Unit"
    // Base Units: Weight(kg), Volume(ml), Temp(C), Baking(g)
    let baseValue = val;

    // 1. To Base
    if (from === "lb") baseValue = val * 0.453592;
    if (from === "g") baseValue = val / 1000;
    if (from === "oz") baseValue = val * 0.0283495;
    if (from === "Cup") baseValue = val * 236.588;
    if (from === "L") baseValue = val * 1000;
    if (from === "tbsp") baseValue = val * 14.7868;
    if (from === "tsp") baseValue = val * 4.92892;
    if (from === "°F") baseValue = (val - 32) * (5 / 9);
    if (from === "K") baseValue = val - 273.15;

    // 2. From Base to Target
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

    return result.toFixed(2);
  };

  const handleTextChange = (value: string, isLeft: boolean) => {
    if (value === "") {
      setInput1("");
      setInput2("");
      return;
    }
    if (isLeft) {
      setInput1(value);
      setInput2(convert(parseFloat(value), unitLeft, unitRight));
    } else {
      setInput2(value);
      setInput1(convert(parseFloat(value), unitRight, unitLeft));
    }
  };

  const swapUnits = () => {
    const tempUnit = unitLeft;
    setUnitLeft(unitRight);
    setUnitRight(tempUnit);
    setInput1(input2);
    setInput2(input1);
  };

  const categories = [
    { id: "Weight", icon: "scale-outline" },
    { id: "Volume", icon: "beaker-outline" },
    { id: "Temperature", icon: "thermometer-outline" },
    { id: "Baking", icon: "restaurant-outline" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerSubtitle}>Unit Converter</Text>
      </View>

      <View style={styles.centeredContent}>
        {!conversionType ? (
          <View style={styles.gridContainer}>
            <Text style={styles.sectionLabel}>Select Category</Text>
            <View style={styles.row}>
              {categories.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.menuCard}
                  onPress={() => setConversionType(item.id)}
                >
                  <View style={styles.iconCircle}>
                    <Ionicons
                      name={item.icon as any}
                      size={30}
                      color="#4A3721"
                    />
                  </View>
                  <Text style={styles.cardLabel}>{item.id}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setConversionType(null)}
            >
              <Ionicons name="chevron-back" size={20} color="#4A3721" />
              <Text style={styles.backText}>MENU</Text>
            </TouchableOpacity>

            <Text style={styles.formTitle}>{conversionType}</Text>

            <View style={styles.inputsRow}>
              {/* Left Side */}
              <View style={styles.inputColumn}>
                <TouchableOpacity
                  style={styles.unitSelector}
                  onPress={() => setShowPicker({ side: "left" })}
                >
                  <Text style={styles.unitText}>{unitLeft}</Text>
                  <Ionicons name="chevron-down" size={14} color="#4A3721" />
                </TouchableOpacity>
                <TextInput
                  style={styles.textInput}
                  value={input1}
                  onChangeText={(t) => handleTextChange(t, true)}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <View style={styles.underline} />
              </View>

              <TouchableOpacity onPress={swapUnits} style={styles.middleIcon}>
                <Ionicons name="swap-horizontal" size={24} color="#4A3721" />
              </TouchableOpacity>

              {/* Right Side */}
              <View style={styles.inputColumn}>
                <TouchableOpacity
                  style={styles.unitSelector}
                  onPress={() => setShowPicker({ side: "right" })}
                >
                  <Text style={styles.unitText}>{unitRight}</Text>
                  <Ionicons name="chevron-down" size={14} color="#4A3721" />
                </TouchableOpacity>
                <TextInput
                  style={styles.textInput}
                  value={input2}
                  onChangeText={(t) => handleTextChange(t, false)}
                  keyboardType="numeric"
                  placeholder="0"
                />
                <View style={styles.underline} />
              </View>
            </View>
          </View>
        )}
      </View>

      {/* --- SIMPLE DROPDOWN MODAL --- */}
      <Modal visible={!!showPicker} transparent animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowPicker(null)}
        >
          <View style={styles.pickerContent}>
            <FlatList
              data={conversionType ? UNIT_OPTIONS[conversionType] : []}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.pickerItem}
                  onPress={() => {
                    if (showPicker?.side === "left") setUnitLeft(item);
                    else setUnitRight(item);
                    setShowPicker(null);
                    setInput1("");
                    setInput2("");
                  }}
                >
                  <Text style={styles.pickerItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2ECE2" },
  header: { paddingTop: 60, alignItems: "center" },
  headerSubtitle: { fontSize: 32, fontWeight: "800", color: "#4A3721" },
  centeredContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  sectionLabel: {
    fontSize: 12,
    color: "#4A3721",
    opacity: 0.4,
    textAlign: "center",
    marginBottom: 30,
    fontWeight: "800",
    letterSpacing: 2,
  },
  gridContainer: { width: "100%", marginBottom: 80 },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 15,
  },
  menuCard: {
    backgroundColor: "#FFFFFF",
    width: (width - 80) / 2,
    height: 140,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 20,
    backgroundColor: "#FDFBF7",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLabel: { fontSize: 14, fontWeight: "700", color: "#4A3721" },
  card: {
    backgroundColor: "#E0C2A0",
    width: width - 50,
    borderRadius: 50,
    padding: 35,
    paddingVertical: 60,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    position: "absolute",
    top: 25,
    left: 25,
  },
  backText: { fontSize: 11, color: "#4A3721", fontWeight: "900" },
  formTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#4A3721",
    textAlign: "center",
    marginBottom: 40,
  },
  inputsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  inputColumn: { width: "42%", alignItems: "center" },
  unitSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 10,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#4A3721",
    marginRight: 5,
  },
  textInput: {
    fontSize: 24,
    fontWeight: "800",
    color: "#202020",
    textAlign: "center",
    width: "100%",
  },
  underline: {
    width: "100%",
    height: 2,
    backgroundColor: "#4A3721",
    marginTop: 8,
    opacity: 0.2,
  },
  middleIcon: { width: "10%", alignItems: "center", marginTop: 25 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  pickerContent: {
    backgroundColor: "#FFF",
    width: 200,
    borderRadius: 20,
    padding: 10,
    maxHeight: 300,
  },
  pickerItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: "#EEE" },
  pickerItemText: {
    fontSize: 18,
    textAlign: "center",
    color: "#4A3721",
    fontWeight: "600",
  },
});
