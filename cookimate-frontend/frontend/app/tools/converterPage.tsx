import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ConverterPage() {
  const router = useRouter();

  // states
  const [conversionType, setConversionType] = useState("Weight");

  // Input values
  const [input1, setInput1] = useState("");
  const [input2, setInput2] = useState("");

  // conversion logics
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
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#5D4037" />
          </TouchableOpacity>
        </View>

        {/* --- TITLE --- */}
        <View style={styles.pageTitleContainer}>
          <Text style={styles.pageTitle}>Kitchen Converter</Text>
        </View>

        {/* --- MAIN CARD --- */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Convert</Text>

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
                    color="#3E2723"
                    style={{ marginRight: 3 }}
                  />
                )}
                <Text style={styles.innerToggleText}>{type}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Inputs */}
          <View style={styles.inputsRow}>
            <View style={styles.inputColumn}>
              <Text style={styles.unitText}>{units.left}</Text>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>From:</Text>
                <TextInput
                  style={styles.textInput}
                  value={input1}
                  onChangeText={(text) => handleConversion(text, true)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#rgba(93, 64, 55, 0.4)"
                />
              </View>
              <View style={styles.underline} />
            </View>

            <View style={styles.inputColumn}>
              <Text style={styles.unitText}>{units.right}</Text>
              <View style={styles.inputFieldContainer}>
                <Text style={styles.inputLabel}>To:</Text>
                <TextInput
                  style={styles.textInput}
                  value={input2}
                  onChangeText={(text) => handleConversion(text, false)}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor="#rgba(93, 64, 55, 0.4)"
                />
              </View>
              <View style={styles.underline} />
            </View>
          </View>
        </View>

        {/* --- MASCOT --- */}
        <View style={styles.mascotContainer}>
          <Image
            source={require("../../assets/images/toast_mascot.png")}
            style={styles.mascotImage}
            resizeMode="contain"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F1E8",
  },
  scrollContent: {
    paddingBottom: 50,
    minHeight: "100%",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EACDB3",
    justifyContent: "center",
    alignItems: "center",
  },
  pageTitleContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3E2723",
  },
  card: {
    backgroundColor: "#E2BC95",
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    height: 380,
    zIndex: 1,
    marginTop: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#160303",
    marginBottom: 20,
  },
  innerToggleContainer: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#3E2723",
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
    borderRightColor: "#3E2723",
  },
  innerToggleActive: {
    backgroundColor: "#F7F1E8",
  },
  innerToggleText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#160303",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#160303",
    marginBottom: 30,
  },
  inputFieldContainer: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: "#5D4037",
    fontWeight: "500",
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#3E2723",
    fontWeight: "bold",
    textAlign: "right",
    padding: 0,
  },
  underline: {
    width: "100%",
    height: 1,
    backgroundColor: "#3E2723",
    opacity: 0.5,
  },
  mascotContainer: {
    alignItems: "flex-end",
    marginRight: 20,
    marginTop: -75,
    zIndex: 10,
  },
  mascotImage: {
    width: 130,
    height: 130,
  },
});
