import { useRouter } from "expo-router";
import { useState ,} from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image
} from "react-native";
import { globalStyle } from "../globalStyleSheet.style";

//fake data to test the front-end
const COMMUNITY_FEED = [
  {
    postId: "p_001", // Unique ID for the post
    userId: "u_101",
    userName: "wenuka",
    image: "https://example.com/pasta.jpg",
    caption: "Secret family lasagna recipe! 🍝",
    likes: 124,
    comments: [
      {
        commentId: "c_001",
        userId: "u_102",
        userName: "BakerJane",
        text: "Looks delicious!",
      },
      {
        commentId: "c_002",
        userId: "u_104",
        userName: "SpicySam",
        text: "Needs more garlic!",
      },
    ],
  },
  {
    postId: "p_002",
    userId: "u_102",
    userName: "kithnula",
    image: "https://example.com/bread.jpg",
    caption: "Fresh sourdough right out of the oven. 🥖",
    likes: 89,
    comments: [],
  },
];

const User_info = [
  {
    firebaseUid: "uid_882341",
    username: "chef_mario",
    name: "Mario Rossi",
    age: 34,
    profilePic:
      "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png",
    points: 1250,
    level: 5,
    followers: 150,
    recipesCookedCount: 42,
    unlockedAchievements: [],
    favorites: [],
  },
  {
    firebaseUid: "uid_991223",
    username: "baker_jane",
    name: "Jane Doe",
    age: 28,
    profilePic:
      "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png",
    points: 800,
    level: 3,
    followers: 95,
    recipesCookedCount: 15,
    unlockedAchievements: [],
    favorites: [],
  },
  {
    firebaseUid: "uid_774455",
    username: "healthy_eats",
    name: "Sam Green",
    age: 24,
    profilePic:
      "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png",
    points: 2100,
    level: 8,
    followers: 430,
    recipesCookedCount: 89,
    unlockedAchievements: [],
    favorites: [],
  },
  {
    firebaseUid: "uid_112233",
    username: "spicy_sam",
    name: "Samuel Jackson",
    age: 40,
    profilePic:
      "https://res.cloudinary.com/cookimate-images/image/upload/v1770965637/profile_pic3_jgp0tk.png",
    points: 450,
    level: 2,
    followers: 20,
    recipesCookedCount: 5,
    unlockedAchievements: [],
    favorites: [],
  },
  {
    firebaseUid: "uid_445566",
    username: "dessert_queen",
    name: "Sophie Miller",
    age: 31,
    profilePic: "https://randomuser.me/api/portraits/women/5.jpg",
    points: 3400,
    level: 12,
    followers: 1200,
    recipesCookedCount: 145,
    unlockedAchievements: [],
    favorites: [],
  },
];

const CommunityFeedCards = () => {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);

  const handleSearch = (text) => {
    setSearch(text);
    if (text.length > 0) {
      const results = User_info.filter((user) =>
        user.username.toLowerCase().includes(text.toLowerCase()),
      );
      setFilteredUsers(results);
    } else {
      setFilteredUsers([]);
    }
  };

  return (
    <View style={[globalStyle.container,styles.container]}>
      {/* --- NEW PARENT VIEW --- */}
      <View style={styles.searchAndAddContainer}>
        {/* Search Section (Flex 5) */}
        <View style={styles.searchSection}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search users..."
            value={search}
            onChangeText={handleSearch}
          />

          {filteredUsers.length > 0 && (
            <View style={styles.dropdown}>
              <FlatList
                data={filteredUsers}
                keyExtractor={(item) => item.firebaseUid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSearch("");
                      setFilteredUsers([]);
                      router.push(`/Community/${item.username}`);
                    }}
                  >
                    <View style={styles.userInfoRow}>
                      <Image
                        source={{ uri: item.profilePic }}
                        style={styles.profileThumbnail}
                      />
                      <Text style={styles.itemText}>{item.username}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}
        </View>

        
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => alert("Add Post Clicked!")}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    marginTop: 15,
    backgroundColor: "#f5f5f5",
  },
  // NEW STYLES
  searchAndAddContainer: {
    flexDirection: "row",
    alignItems: "flex-start", // Keeps button at the top even if dropdown opens
    gap: 10,
    zIndex: 10,
  },
  searchSection: {
    flex: 3, 
    position: "relative",
  },
  addButton: {
    flex: 1, 
    height: 50,
    backgroundColor: "#9ada3b", 
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  
  searchInput: {
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  userInfoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileThumbnail: {
    width: 35, // Set a fixed width
    height: 35, // Set a fixed height
    borderRadius: 17.5, // Makes it a circle (half of width/height)
    marginRight: 12,
    backgroundColor: "#ddd",
  },
  itemText: {
    fontSize: 16,
    fontWeight: "500", // Makes the username slightly bolder
    color: "#333",
  },
  dropdown: {
    position: "absolute",
    top: 55,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 10,
    maxHeight: 200,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  itemText: {
    fontSize: 16,
    color: "#333",
  },
});

export default CommunityFeedCards;
