import { Pressable, StyleSheet, Text, View } from "react-native";

type NavCardProps = {
  title: string;
  icon: string;
  description: string;
};
const NavCard = ({ title, icon, description }:NavCardProps ) => {
  return (
    <Pressable style={({ pressed }) => []}>
      <View>
        <Text>{icon}</Text>
      </View>
      <View>
        <Text>{title}</Text>
        <Text>{description}</Text>
      </View>
    </Pressable>
  );
};

function HomePage() {
  return (
    <>
      <NavCard title="search-page" icon="🔍" description={"Testing the Reusable Card component"}></NavCard>
       <NavCard title="search-page" icon="🔍" description={"Testing the Reusable Card component 2"}></NavCard>
    </>
  );
}

const styles = StyleSheet.create({});

export default HomePage;
