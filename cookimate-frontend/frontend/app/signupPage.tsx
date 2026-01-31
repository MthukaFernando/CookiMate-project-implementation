import { View, Text, StyleSheet, ImageBackground } from 'react-native';
import { Link } from 'expo-router';

export default function SignupPage() {
  return (
    <ImageBackground
      source ={require('../assets/images/background.jpeg')}
      style={styles.container}
      resizeMode="cover"
      >
    <View style={styles.container}>
      <Text style={styles.title}>This is the Sign Up Page</Text>
      
      {/* Link back Home */}
      <Link href="/" style={styles.link}>
        Back to Home Page
      </Link>
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  link: {
    color: 'blue',
    fontSize: 16,
  },
});