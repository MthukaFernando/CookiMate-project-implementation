import React from 'react';
import { View, Text, Image, Pressable, TouchableOpacity, FlatList, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';

export default function CommunityUserProfile() {
  const { CommunityUserid } = useLocalSearchParams();
  const router = useRouter();

  const user = {
    name: CommunityUserid || "Guest Cook",
    handle: `@${CommunityUserid?.toString().toLowerCase().replace(/\s/g, '') || 'user'}`,
    bio: "Passionate home cook!",
    stats: { recipes: 24, followers: "1.2k", following: 150 },
    posts: [
      { id: '1', uri: 'https://picsum.photos/id/102/400/400' },
      { id: '2', uri: 'https://picsum.photos/id/103/400/400' },
      { id: '3', uri: 'https://picsum.photos/id/104/400/400' },
      { id: '4', uri: 'https://picsum.photos/id/106/400/400' },
      { id: '5', uri: 'https://picsum.photos/id/107/400/400' },
      { id: '6', uri: 'https://picsum.photos/id/108/400/400' },
    ]
  };

  const ProfileHeader = () => (
    <View>
      <Pressable onPress={() => router.back()}>
        <Text>Back</Text>
      </Pressable>

      <View>
        <Image source={{ uri: `https://i.pravatar.cc/150?u=${CommunityUserid}` }} />
      </View>

      <Text>{user.name}</Text>
      <Text>{user.handle}</Text>
      <Text>ID: {CommunityUserid}</Text>
      <Text>{user.bio}</Text>

      <View>
        <View>
          <Text>{user.stats.recipes}</Text>
          <Text>Recipes</Text>
        </View>
        <View>
          <Text>{user.stats.followers}</Text>
          <Text>Followers</Text>
        </View>
        <View>
          <Text>{user.stats.following}</Text>
          <Text>Following</Text>
        </View>
      </View>

      <Pressable>
        <Text>Follow</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView>
      <FlatList
        data={user.posts}
        keyExtractor={(item) => item.id}
        numColumns={3}
        ListHeaderComponent={ProfileHeader}
        renderItem={({ item }) => (
          <View>
            <Image source={{ uri: item.uri }} />
          </View>
        )}
      />

      <TouchableOpacity onPress={() => router.push('/Community/CommunityFeedCards')}>
        <Text>Go to Community Feed cards</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}