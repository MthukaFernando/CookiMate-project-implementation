import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import Constants from "expo-constants";

const debuggerHost = Constants.expoConfig?.hostUri;
const address = debuggerHost ? debuggerHost.split(":")[0] : "localhost";
const API_URL = `http://${address}:5000`;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👨‍🍳 Hi! I'm your CookiMate AI Chef. Ask me anything about cooking, ingredients, or kitchen tips!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // FAB pulse animation
  const pulseAnim = useRef(new Animated.Value(1)).current;
  // Chat slide-up animation
  const slideAnim = useRef(new Animated.Value(300)).current;

  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Gentle pulse on FAB to draw attention
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  useEffect(() => {
    if (isOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 60,
        friction: 10,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages, isThinking]);

  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isThinking) return;

    const updatedMessages: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(updatedMessages);
    setInput("");
    setIsThinking(true);

    try {
      const response = await axios.post(`${API_URL}/api/recipes/global-chat`, {
        messages: updatedMessages,
      });
      setMessages([
        ...updatedMessages,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (err) {
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, the chef is a bit busy right now. Try again shortly!",
        },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Animated.View
          style={[styles.fabWrapper, { transform: [{ scale: pulseAnim }] }]}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsOpen(true)}
            activeOpacity={0.85}
          >
            <Image
              source={require('../assets/images/chatbot-mascot.png')}
              style={styles.fabImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Chat Modal */}
      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.overlay} pointerEvents="box-none">
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.kvContainer}
            keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          >
            <Animated.View
              style={[
                styles.chatSheet,
                { transform: [{ translateY: slideAnim }] },
              ]}
            >
              {/* Header */}
              <View style={styles.header}>
                <View style={styles.headerLeft}>
                  <View style={styles.avatarCircle}>
                    <Image
                      source={require('../assets/images/chatbot-mascot.png')}
                      style={styles.avatarImage}
                      resizeMode="contain"
                    />
                  </View>
                  <View>
                    <Text style={styles.headerTitle}>CookiMate Chef</Text>
                    <View style={styles.onlineRow}>
                      <View style={styles.onlineDot} />
                      <Text style={styles.onlineText}>Online</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setIsOpen(false)}
                >
                  <Ionicons name="chevron-down" size={22} color="#D4AF37" />
                </TouchableOpacity>
              </View>

              {/* Divider */}
              <View style={styles.divider} />

              {/* Messages */}
              <ScrollView
                ref={scrollRef}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((msg, i) => (
                  <View
                    key={i}
                    style={[
                      styles.bubbleRow,
                      msg.role === "user"
                        ? styles.bubbleRowUser
                        : styles.bubbleRowChef,
                    ]}
                  >
                    {msg.role === "assistant" && (
                      <View style={styles.chefAvatarSmall}>
                        <Image
                          source={require('../assets/images/chatbot-mascot.png')}
                          style={styles.smallAvatarImage}
                          resizeMode="contain"
                        />
                      </View>
                    )}
                    <View
                      style={[
                        styles.bubble,
                        msg.role === "user"
                          ? styles.userBubble
                          : styles.chefBubble,
                      ]}
                    >
                      <Text
                        style={
                          msg.role === "user"
                            ? styles.userText
                            : styles.chefText
                        }
                      >
                        {msg.content}
                      </Text>
                    </View>
                  </View>
                ))}

                {/* Typing indicator */}
                {isThinking && (
                  <View style={[styles.bubbleRow, styles.bubbleRowChef]}>
                    <View style={styles.chefAvatarSmall}>
                      <Image
                        source={require('../assets/images/chatbot-mascot.png')}
                        style={styles.smallAvatarImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View style={[styles.bubble, styles.chefBubble, styles.typingBubble]}>
                      <View style={styles.typingDots}>
                        <TypingDot delay={0} />
                        <TypingDot delay={200} />
                        <TypingDot delay={400} />
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Input Row */}
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask the chef anything..."
                  placeholderTextColor="#555"
                  onSubmitEditing={handleSend}
                  returnKeyType="send"
                  multiline={false}
                  editable={!isThinking}
                />
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    (!input.trim() || isThinking) && styles.sendBtnDisabled,
                  ]}
                  onPress={handleSend}
                  disabled={!input.trim() || isThinking}
                >
                  {isThinking ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <Ionicons name="send" size={18} color="#000" />
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

// Animated typing dot sub-component
function TypingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, {
          toValue: -5,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(600 - delay),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View
      style={[styles.dot, { transform: [{ translateY: anim }] }]}
    />
  );
}

const styles = StyleSheet.create({
  // FAB
  fabWrapper: {
    position: "absolute",
    bottom: 80,
    right: 22,
    zIndex: 999,
  },
  fab: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.45,
    shadowRadius: 10,
    borderWidth: 2.5,
    borderColor: "#D4AF37",
    overflow: "hidden",
  },
  fabImage: {
    width: 44,
    height: 44,
  },

  // Modal overlay
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  kvContainer: {
    justifyContent: "flex-end",
  },

  // Chat sheet
  chatSheet: {
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#222",
    height: "78%",
    overflow: "hidden",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    overflow: "hidden",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarImage: {
    width: 34,
    height: 34,
  },
  avatarEmoji: {
    fontSize: 22,
  },
  headerTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  onlineRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  onlineText: {
    color: "#4CAF50",
    fontSize: 11,
    fontWeight: "500",
  },
  closeBtn: {
    padding: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#1E1E1E",
    marginHorizontal: 0,
  },

  // Messages
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  bubbleRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-end",
  },
  bubbleRowUser: {
    justifyContent: "flex-end",
  },
  bubbleRowChef: {
    justifyContent: "flex-start",
  },
  chefAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    flexShrink: 0,
    overflow: "hidden",
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 2,
  },
  smallAvatarImage: {
    width: 22,
    height: 22,
  },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: "78%",
  },
  userBubble: {
    backgroundColor: "#D4AF37",
    borderBottomRightRadius: 4,
  },
  chefBubble: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderBottomLeftRadius: 4,
  },
  userText: {
    color: "#000000",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
  },
  chefText: {
    color: "#E8E8E8",
    fontSize: 14,
    lineHeight: 21,
  },

  // Typing indicator
  typingBubble: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  typingDots: {
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
    height: 16,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#D4AF37",
    marginHorizontal: 2,
  },

  // Input
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#1E1E1E",
    backgroundColor: "#0A0A0A",
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#161616",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: "#FFFFFF",
    fontSize: 14,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    height: 44,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#D4AF37",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  sendBtnDisabled: {
    backgroundColor: "#3A3A2A",
    shadowOpacity: 0,
    elevation: 0,
  },
});
