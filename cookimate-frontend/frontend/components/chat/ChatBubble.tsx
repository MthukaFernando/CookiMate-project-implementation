import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ChatBubbleProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ text, isUser, timestamp }) => {
  return (
    <View style={[
      styles.container,
      isUser ? styles.userContainer : styles.aiContainer
    ]}>
      <View style={[
        styles.bubble,
        isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <Text style={styles.text}>{text}</Text>
        <Text style={styles.timestamp}>
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    marginHorizontal: 12,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  aiContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#4CAF50',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: '#E0E0E0',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
    opacity: 0.7,
    color: '#000',
  },
});