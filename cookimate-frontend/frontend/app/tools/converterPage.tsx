import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConverterPage() {
  // --- STATE ---
  const [conversionType, setConversionType] = useState("Weight");
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  // --- LOGIC ---
  const getUnits = () => {
    switch (conversionType) {
      case "Temperature":
        return { left: "°F", right: "°C" };
      case "Volume":
        return { left: "Cup", right: "ml" };
      default:
        return { left: "lb", right: "kg" };
    }
  };

  const units = getUnits();

  // Clear inputs when switching unit types
  useEffect(() => {
    setInput1("");
    setInput2("");
  }, [conversionType]);

  const handleConversion = (value: string, isLeft: boolean) => {
    if (isLeft) setInput1(value);
    else setInput2(value);

    if (value === "") {
      setInput1("");
      setInput2("");
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return;

    let result = 0;

    if (conversionType === "Weight") {
      if (isLeft) result = num * 0.453592;
      else result = num / 0.453592;
    } else if (conversionType === "Temperature") {
      if (isLeft) result = (num - 32) * (5 / 9);
      else result = (num * 9) / 5 + 32;
    } else if (conversionType === "Volume") {
      if (isLeft) result = num * 236.588;
      else result = num / 236.588;
    }

    const formattedResult = result.toFixed(2);
    if (isLeft) setInput2(formattedResult);
    else setInput1(formattedResult);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- MAIN CARD --- */}
        <View style={styles.card}>
          {/* Type Selector */}
          <View style={styles.innerToggleContainer}>
            {["Weight", "Temperature", "Volume"].map((type, index) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.innerToggleBtn,
                  conversionType === type && styles.innerToggleActive,
                  index !== 2 && styles.innerToggleBorder,
                ]}
                onPress={() => setConversionType(type)}
              >
                {conversionType === type && (
                  <Ionicons
                    name="checkmark"
                    size={14}
                    color="#4A3721"
                    style={{ marginRight: 3 }}
                  />
                )}
                <Text style={styles.innerToggleText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Input Fields */}
          <View style={styles.inputsRow}>
            {/* Left Column */}
            <View style={styles.inputColumn}>
              <Text style={styles.unitText}>{units.left}</Text>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>From</Text>
                <TextInput
                  style={styles.textInput}
                  value={input1}
                  onChangeText={(text) => handleConversion(text, true)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="rgba(74, 55, 33, 0.4)"
                />
              </View>
              <View style={styles.underline} />
            </View>

            {/* Right Column */}
            <View style={styles.inputColumn}>
              <Text style={styles.unitText}>{units.right}</Text>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>To</Text>
                <TextInput
                  style={styles.textInput}
                  value={input2}
                  onChangeText={(text) => handleConversion(text, false)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="rgba(74, 55, 33, 0.4)"
                />
              </View>
              <View style={styles.underline} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2ECE2",
  },
  scrollContent: {
    paddingBottom: 50,
    minHeight: "100%",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#E0C2A0",
    marginHorizontal: 25,
    borderRadius: 50,
    padding: 30,
    paddingTop: 90,
    paddingBottom: 90,
    zIndex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  innerToggleContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#4A3721",
    borderRadius: 20,
    height: 40,
    marginBottom: 40,
    overflow: "hidden",
  },
  innerToggleBtn: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  innerToggleBorder: {
    borderRightWidth: 1,
    borderRightColor: "#4A3721",
  },
  innerToggleActive: {
    backgroundColor: "#F2ECE2",
  },
  innerToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4A3721",
  },
  inputsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  inputColumn: {
    alignItems: "center",
    width: "45%",
  },
  unitText: {
    fontSize: 24,
    fontWeight: "300",
    color: "#202020",
    marginBottom: 20,
    fontFamily: "System",
  },
  inputFieldContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: "#9e784d",
    fontWeight: "bold",
    marginRight: 10,
    letterSpacing: 1,
  },
  textInput: {
    flex: 1,
    fontSize: 22,
    color: "#202020",
    fontWeight: "600",
    textAlign: "right",
    padding: 0,
  },
  underline: {
    width: "100%",
    height: 2,
    backgroundColor: "#4A3721",
    opacity: 0.3,
  },
});
