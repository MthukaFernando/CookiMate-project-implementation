import { Pressable, StyleSheet, Text, View } from "react-native";

type NavCardProps = {
  title: string;
  icon: string;
  description: string;
};
const NavCard = ({ title, icon, description }:NavCardProps ) => {
  return (
    <Pressable style={({ pressed }) => [styles.card ,pressed && styles.cardPressed ]}>
      <View style={styles.iconCircle} >
        <Text>{icon}</Text>
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDescription}>{description}</Text>
      </View>
    </Pressable>
  );
};

function HomePage() {
  return (
    <View>
      <NavCard title="search-page" icon="🔍" description={"Testing the Reusable Card component"}></NavCard>
      <NavCard title="community -page" icon="🔍" description={"Testing the Reusable Card component 2"}></NavCard>
      
    </View>
  );
}

const styles = StyleSheet.create({
card  : {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 15,
    
    borderRadius: 20,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
     
  
  },
  cardPressed: {
    transform: [{ scale: 0.98 }],
    backgroundColor: '#f9f9f9cb',
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardTextContainer: { flex: 1 },
  cardTitle: { fontSize: 18, color: '#333' },
  cardDescription: { fontSize: 14, color: '#777', marginTop: 2 },




});

export default HomePage;
