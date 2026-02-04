import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  Dimensions,
  TextInput 
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface NavIconProps {
  icon: any; 
  label: string;
  active?: boolean; 
}

export default function ConverterPage() {
  const router = useRouter();
  
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'Timer' | 'Converter'>('Converter');
  const [conversionType, setConversionType] = useState('Weight');
  
  // Input values
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');

  // --- LOGIC ---
  const getUnits = () => {
    switch (conversionType) {
      case 'Temperature': return { left: '°F', right: '°C' };
      case 'Volume': return { left: 'Cup', right: 'ml' };
      default: return { left: 'lb', right: 'kg' }; 
    }
  };

  const units = getUnits();

  useEffect(() => {
    setInput1('');
    setInput2('');
  }, [conversionType]);

  const handleConversion = (value: string, isLeft: boolean) => {
    if (isLeft) setInput1(value);
    else setInput2(value);

    if (value === '') {
      setInput1('');
      setInput2('');
      return;
    }

    const num = parseFloat(value);
    if (isNaN(num)) return; 

    let result = 0;

    if (conversionType === 'Weight') {
      if (isLeft) result = num * 0.453592;
      else result = num / 0.453592;
    } 
    else if (conversionType === 'Temperature') {
      if (isLeft) result = (num - 32) * (5/9);
      else result = (num * 9/5) + 32;
    } 
    else if (conversionType === 'Volume') {
      if (isLeft) result = num * 236.588;
      else result = num / 236.588;
    }

    const formattedResult = result.toFixed(2);
    if (isLeft) setInput2(formattedResult);
    else setInput1(formattedResult);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        
        {/* --- HEADER --- */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#5D4037" />
          </TouchableOpacity>
        </View>

        {/* --- TOP TOGGLE --- */}
        <View style={styles.topToggleWrapper}>
          <View style={styles.topToggleContainer}>
            <TouchableOpacity 
              style={[styles.topToggleBtn, activeTab === 'Timer' && styles.topToggleActive]}
              onPress={() => setActiveTab('Timer')}
            >
              <Text style={styles.topToggleText}>Timer</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.topToggleBtn, activeTab === 'Converter' && styles.topToggleActive]}
              onPress={() => setActiveTab('Converter')}
            >
              {activeTab === 'Converter' && (
                <Ionicons name="checkmark" size={16} color="#3E2723" style={{marginRight: 5}}/>
              )}
              <Text style={styles.topToggleText}>Converter</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ========================================================== */}
        {/* CONDITIONAL RENDERING START                  */}
        {/* ========================================================== */}

        {activeTab === 'Timer' ? (
          
          /* --- TIMER VIEW (Using your code) --- */
          <View style={styles.timerContainer}>
            <Text style={styles.timerText}>This is the timer page</Text>
             {/* You can add your actual timer logic here later! */}
          </View>

        ) : (

          /* --- CONVERTER VIEW --- */
          <View>
             {/* Main Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Converter</Text>

              {/* Type Selector */}
              <View style={styles.innerToggleContainer}>
                {['Weight', 'Temperature', 'Volume'].map((type, index) => (
                  <TouchableOpacity 
                    key={type}
                    style={[
                      styles.innerToggleBtn, 
                      conversionType === type && styles.innerToggleActive,
                      index !== 2 && styles.innerToggleBorder 
                    ]}
                    onPress={() => setConversionType(type)}
                  >
                    {conversionType === type && (
                      <Ionicons name="checkmark" size={14} color="#3E2723" style={{marginRight: 3}}/>
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

            {/* Mascot (Only show on Converter tab) */}
            <View style={styles.mascotContainer}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' }} 
                style={styles.mascotImage}
                resizeMode="contain"
              />
            </View>
          </View>
        )}
      </ScrollView>

      {/* --- BOTTOM BAR --- */}
      <View style={styles.bottomBar}>
        <NavIcon icon="home-outline" label="HOME" />
        <NavIcon icon="timer-outline" label="TOOLS" active={true} />
        <NavIcon icon="calendar-outline" label="PLANNER" />
        <NavIcon icon="cart-outline" label="SHOP" />
        <NavIcon icon="person-outline" label="PROFILE" />
      </View>

    </SafeAreaView>
  );
}

const NavIcon: React.FC<NavIconProps> = ({ icon, label, active = false }) => (
  <View style={styles.navItem}>
    <Ionicons name={icon} size={24} color={active ? '#A1887F' : '#3E2723'} />
    <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F1E8', 
  },
  scrollContent: {
    paddingBottom: 100, 
    minHeight: '100%', // Ensures the background fills the screen
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EACDB3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  topToggleWrapper: {
    alignItems: 'center',
    marginBottom: 30,
  },
  topToggleContainer: {
    flexDirection: 'row',
    width: width * 0.75,
    height: 46,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#8D6E63',
    overflow: 'hidden',
  },
  topToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  topToggleActive: {
    backgroundColor: '#EACDB3', 
  },
  topToggleText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3E2723',
  },
  
  // --- TIMER STYLES ---
  timerContainer: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timerText: {
    fontSize: 20,
    color: '#333',
    fontWeight: 'bold',
  },

  // --- CONVERTER STYLES ---
  card: {
    backgroundColor: '#E2BC95', 
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    height: 380, 
    zIndex: 1, 
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#160303',
    marginBottom: 20,
  },
  innerToggleContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#3E2723',
    borderRadius: 20,
    height: 40,
    marginBottom: 40,
    overflow: 'hidden',
  },
  innerToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerToggleBorder: {
    borderRightWidth: 1,
    borderRightColor: '#3E2723',
  },
  innerToggleActive: {
    backgroundColor: '#F7F1E8', 
  },
  innerToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#160303',
  },
  inputsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  inputColumn: {
    alignItems: 'center',
    width: '45%', 
  },
  unitText: {
    fontSize: 18, 
    fontWeight: 'bold',
    color: '#160303',
    marginBottom: 30,
  },
  inputFieldContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  inputLabel: {
    fontSize: 14,
    color: '#5D4037',
    fontWeight: '500',
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#3E2723',
    fontWeight: 'bold',
    textAlign: 'right', 
    padding: 0,
  },
  underline: {
    width: '100%',
    height: 1,
    backgroundColor: '#3E2723',
    opacity: 0.5,
  },
  mascotContainer: {
    alignItems: 'flex-end',
    marginRight: 25,
    marginTop: -55, 
    zIndex: 10, 
  },
  mascotImage: {
    width: 90, 
    height: 90,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#E2BC95',
    paddingVertical: 15,
    paddingBottom: 30, 
    zIndex: 20,
  },
  navItem: {
    alignItems: 'center',
  },
  navLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#3E2723',
  },
  navLabelActive: {
    color: '#A1887F', 
  },
});