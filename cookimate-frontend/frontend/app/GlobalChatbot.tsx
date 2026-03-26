import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Updated to fix the warning
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;
const FAB_SIZE = 62;

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

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(300)).current;
  const scrollRef = useRef<ScrollView>(null);

  // NEW: Pan ref for dragging
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // NEW: PanResponder logic
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        // @ts-ignore
        pan.setOffset({ x: pan.x._value, y: pan.y._value });
        pan.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;

        // Sticky logic: snap to left or right
        const snapRight = 0;
        const snapLeft = -(SCREEN_WIDTH - FAB_SIZE - 44);

        // Vertical logic: Don't go below bottom navbar (50px buffer)
        const maxY = 50;
        const minY = -(SCREEN_HEIGHT - 250);

        const finalX =
          Math.abs(currentX - snapLeft) < Math.abs(currentX - snapRight)
            ? snapLeft
            : snapRight;
        const finalY = Math.max(minY, Math.min(currentY, maxY));

        Animated.spring(pan, {
          toValue: { x: finalX, y: finalY },
          useNativeDriver: false,
          friction: 7,
        }).start();
      },
    }),
  ).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.12,
          duration: 900,
          useNativeDriver: false, // CHANGED TO FALSE TO FIX THE ERROR
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false, // CHANGED TO FALSE TO FIX THE ERROR
        }),
      ]),
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
        { role: "assistant", content: "Chef is busy right now!" },
      ]);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <>
      {!isOpen && (
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.fabWrapper,
            {
              transform: [
                { translateX: pan.x },
                { translateY: pan.y },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.fab}
            onPress={() => setIsOpen(true)}
            activeOpacity={0.85}
          >
            <Image
              source={require("../assets/images/chatbot-mascot.png")}
              style={styles.fabImage}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </Animated.View>
      )}

      <Modal
        visible={isOpen}
        transparent
        animationType="none"
        onRequestClose={() => setIsOpen(false)}
      >
        <SafeAreaView style={styles.overlay} edges={["bottom"]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={styles.kvContainer}
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
                      source={require("../assets/images/chatbot-mascot.png")}
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

              <View style={styles.divider} />

              <ScrollView
                ref={scrollRef}
                style={styles.messagesList}
                contentContainerStyle={styles.messagesContent}
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
                          source={require("../assets/images/chatbot-mascot.png")}
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
                {isThinking && (
                  <View style={[styles.bubbleRow, styles.bubbleRowChef]}>
                    <View style={styles.chefAvatarSmall}>
                      <Image
                        source={require("../assets/images/chatbot-mascot.png")}
                        style={styles.smallAvatarImage}
                        resizeMode="contain"
                      />
                    </View>
                    <View
                      style={[
                        styles.bubble,
                        styles.chefBubble,
                        styles.typingBubble,
                      ]}
                    >
                      <View style={styles.typingDots}>
                        <TypingDot delay={0} />
                        <TypingDot delay={200} />
                        <TypingDot delay={400} />
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask the chef anything..."
                  placeholderTextColor="#555"
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

function TypingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
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
      ]),
    ).start();
  }, []);
  return (
    <Animated.View
      style={[styles.dot, { transform: [{ translateY: anim }] }]}
    />
  );
}

const styles = StyleSheet.create({
  fabWrapper: {
    position: "absolute",
    bottom: 150,
    right: 22,
    zIndex: 9999,
    elevation: 20,
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
  fabImage: { width: 44, height: 44 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  kvContainer: { justifyContent: "flex-end" },
  chatSheet: {
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderWidth: 1,
    borderColor: "#222",
    height: "78%",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
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
  },
  avatarImage: { width: 34, height: 34 },
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "700" },
  onlineRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  onlineText: { color: "#4CAF50", fontSize: 11, fontWeight: "500" },
  closeBtn: {
    padding: 8,
    backgroundColor: "#1A1A1A",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#333",
  },
  divider: { height: 1, backgroundColor: "#1E1E1E" },
  messagesList: { flex: 1 },
  messagesContent: { paddingHorizontal: 16, paddingVertical: 16 },
  bubbleRow: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
  bubbleRowUser: { justifyContent: "flex-end" },
  bubbleRowChef: { justifyContent: "flex-start" },
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
    overflow: "hidden",
  },
  smallAvatarImage: { width: 22, height: 22 },
  bubble: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    maxWidth: "78%",
  },
  userBubble: { backgroundColor: "#D4AF37", borderBottomRightRadius: 4 },
  chefBubble: {
    backgroundColor: "#161616",
    borderWidth: 1,
    borderColor: "#2A2A2A",
    borderBottomLeftRadius: 4,
  },
  userText: { color: "#000000", fontSize: 14, fontWeight: "600" },
  chefText: { color: "#E8E8E8", fontSize: 14 },
  typingBubble: { paddingVertical: 12, paddingHorizontal: 16 },
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
  },
  sendBtnDisabled: { backgroundColor: "#3A3A2A" },
});
