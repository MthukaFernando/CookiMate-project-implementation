import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Platform,
  Animated,
  ActivityIndicator,
  Image,
  PanResponder,
  Dimensions,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const API_URL = `https://cookimate-project-implementation-m4on.onrender.com`;
const FAB_SIZE = 62;

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function RecipeChatbot({
  recipeId,
}: {
  recipeId: string | number;
}) {
  const insets = useSafeAreaInsets();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "👨‍🍳 Hi! I'm your CookiMate AI Chef. Ask me anything about this recipe!",
    },
  ]);
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);

  // Animations
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const keyboardOffset = useRef(new Animated.Value(0)).current; // Manual lift
  const scrollRef = useRef<ScrollView>(null);
  const pan = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;

  // --- Keyboard Manual Animation Logic ---
  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onKeyboardShow = (e: any) => {
      Animated.timing(keyboardOffset, {
        toValue:
          -e.endCoordinates.height + (Platform.OS === "android" ? 20 : 0),
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const onKeyboardHide = () => {
      Animated.timing(keyboardOffset, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    };

    const showSub = Keyboard.addListener(showEvent, onKeyboardShow);
    const hideSub = Keyboard.addListener(hideEvent, onKeyboardHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gs) =>
        Math.abs(gs.dx) > 5 || Math.abs(gs.dy) > 5,
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
        const finalX =
          (pan.x as any)._value < -(SCREEN_WIDTH / 2)
            ? -(SCREEN_WIDTH - FAB_SIZE - 44)
            : 0;
        Animated.spring(pan, {
          toValue: { x: finalX, y: (pan.y as any)._value },
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
          useNativeDriver: false,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 900,
          useNativeDriver: false,
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
        toValue: SCREEN_HEIGHT,
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
    const updated: Message[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(updated);
    setInput("");
    setIsThinking(true);
    try {
      const response = await axios.post(`${API_URL}/api/recipes/chat-recipe`, {
        recipeId,
        message: trimmed,
      });
      setMessages([
        ...updated,
        { role: "assistant", content: response.data.reply },
      ]);
    } catch (err) {
      setMessages([
        ...updated,
        { role: "assistant", content: "Chef is busy!" },
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
          <TouchableOpacity style={styles.fab} onPress={() => setIsOpen(true)}>
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
        statusBarTranslucent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.overlay}>
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              setIsOpen(false);
            }}
          >
            <View style={styles.dismissArea} />
          </TouchableWithoutFeedback>

          <Animated.View
            style={[
              styles.chatSheet,
              {
                // Slide Up + Keyboard Lift
                transform: [
                  { translateY: slideAnim },
                  { translateY: keyboardOffset },
                ],
                height: SCREEN_HEIGHT * 0.6, // <--- SET TO 0.6 AS REQUESTED
                paddingBottom: insets.bottom,
              },
            ]}
          >
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
                        msg.role === "user" ? styles.userText : styles.chefText
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

            <View style={styles.inputContainer}>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask about this recipe..."
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
            </View>
          </Animated.View>

          {/* Gap filler ensures zero "peak-through" when keyboard lifts the view */}
          <View style={[styles.bottomGapFiller, { height: SCREEN_HEIGHT }]} />
        </View>
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
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2.5,
    borderColor: "#D4AF37",
  },
  fabImage: { width: 44, height: 44 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  dismissArea: { flex: 1 },
  chatSheet: {
    backgroundColor: "#0A0A0A",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    width: "100%",
    zIndex: 10,
  },
  bottomGapFiller: {
    backgroundColor: "#0A0A0A",
    position: "absolute",
    bottom: -SCREEN_HEIGHT,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF",
    borderWidth: 2,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarImage: { width: 34, height: 34 },
  headerTitle: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  onlineRow: { flexDirection: "row", alignItems: "center" },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#4CAF50",
    marginRight: 5,
  },
  onlineText: { color: "#4CAF50", fontSize: 11 },
  closeBtn: { padding: 8, backgroundColor: "#1A1A1A", borderRadius: 20 },
  divider: { height: 1, backgroundColor: "#1E1E1E" },
  messagesList: { flex: 1 },
  messagesContent: { padding: 16 },
  bubbleRow: { flexDirection: "row", marginBottom: 12, alignItems: "flex-end" },
  bubbleRowUser: { justifyContent: "flex-end" },
  bubbleRowChef: { justifyContent: "flex-start" },
  chefAvatarSmall: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FFF",
    borderWidth: 1.5,
    borderColor: "#D4AF37",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
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
  userText: { color: "#000", fontWeight: "600" },
  chefText: { color: "#E8E8E8" },
  typingBubble: { padding: 12 },
  typingDots: { flexDirection: "row", gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#D4AF37" },
  inputContainer: {
    backgroundColor: "#0A0A0A",
    borderTopWidth: 1,
    borderTopColor: "#1E1E1E",
    paddingBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: "#161616",
    borderRadius: 24,
    paddingHorizontal: 16,
    color: "#FFF",
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
