import React, {useState} from 'react';
import {useRouter} from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UploadPost() {
    const router = useRouter();
    const [caption, setCaption] = useState('');
    const [image, setImage] = useState(null);

    return (
        <SafeAreaView>
            <View>
                <TouchableOpacity onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#5F4436" />
                </TouchableOpacity>
                <Text>New Post</Text>
                <TouchableOpacity onPress={() => {
                    alert('Post uploaded!');
                    router.back();
                }}>
                <Text>Post</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};