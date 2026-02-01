import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput } from 'react-native';
import { Link, useRouter } from 'expo-router';

export default function LoginPage() {
  const router = useRouter(); 

  return (
    <ImageBackground
      source={require('../assets/images/background.jpeg')}
      style={styles.container}
      resizeMode="cover" 
    >
      <View style={styles.card}>
        <Text style={styles.label}>User Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter username"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#999"
          secureTextEntry
        />
        
        <TouchableOpacity onPress={() => {}}>
          <Text style={styles.forgot}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.loginButton}>
          <Text style={styles.loginText}>Log in</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <View style={styles.navContainer}>
            {/* Link to Signup */}
            <Link href="/signupPage" style={styles.link}>
              Don't have an account? Sign up
            </Link>

            
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
  flex: 1,
  justifyContent: 'flex-end', 
  alignItems: 'center',
},

  title: {
    fontSize: 22,
    marginBottom: 20,
  },
  navContainer: {
  flexDirection: 'row',    
  justifyContent: 'space-between', 
  alignItems: 'center',
  marginTop: 10,
},


  link: {
    color: 'black',
    fontSize: 16,
  },
  homeLink: {
    color: 'gray',
    fontSize: 14,
    marginTop: 10,
  },
  card: {
  position: 'absolute',     
  bottom: 40,               
  left: 20,                 
  right: 20,                
  backgroundColor: "#fff1c4",
  padding: 20,
  borderRadius: 12,
},

  label: {
    fontSize: 14,
    marginBottom: 6,
    color: "#160303",
  },
  input: {
    borderWidth: 1,
    backgroundColor:"white",
    borderColor: "#ffffff",
    borderRadius: 8,
    height: 40,
    padding: 10,
    marginBottom: 15,
  },
  loginButton: {
    backgroundColor: "#5f4436e6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 5,
  },
  loginText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  forgot: {
    fontSize: 13,
    color: "#333",
    textDecorationLine: 'underline',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  
  signupText: {
    color: "#fff",
    fontSize: 13,
    
  },
});
