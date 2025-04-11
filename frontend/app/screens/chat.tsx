import React, { useState, useEffect, useRef } from "react";
import { Ionicons } from "@expo/vector-icons"; 
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator ,
  Alert
} from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from "@react-native-async-storage/async-storage"; 
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator"; 
import { isTokenExpired, refreshToken } from "../utils/auth"; 
import { initializeWebSocket, closeWebSocket } from "../utils/webSocket";
import styles from "../styles/Chatstyle";
import axiosInstance from "../utils/apiHelper"; 
import ChatHistory from "../utils/ChatHistory"; 
import uuid from  "react-native-uuid";




const userId = 1;



type Message = {
  message: string;
  direction: "incoming" | "outgoing";
  sender: "user" | "bot";
  source?: string;

};
type Props= NativeStackScreenProps<RootStackParamList, "Chat">;


const Chat: React.FC<Props> = ({navigation})  =>  {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
const [showMealLogForm, setShowMealLogForm] = useState(false);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [chatHistory, setChatHistory] = useState<Message[]>([]);
const [chatSessions, setChatSessions] = useState<{ session_id: string, title: string, timestamp: string }[]>([]);
const [loadingHistory, setLoadingHistory] = useState(false);
const [currentSessionId, setCurrentSessionId] = useState<string>(uuid.v4() as string);





  const scrollViewRef = useRef<ScrollView>(null);
 
  useEffect(() => {
    loadChatHistory(); 
    initializeWebSocket(setMessages, setSocket, navigation);

    return () => {
      closeWebSocket();
      setSocket(null);
    };
  }, []);

  
  const loadChatHistory = async () => {
    try {
      const response = await axiosInstance.get("/api/v1/chat-history");
      const history = response.data.history;
  
      const grouped = Object.values(
        history.reduce((acc: Record<string, { session_id: string; title: string; timestamp: string }>, item: any) => {
          const id = item.session_id;
          if (!acc[id]) {
            acc[id] = {
              session_id: id,
              title: item.user_message,
              timestamp: item.timestamp,
            };
          }
          return acc;
        }, {})
      ) as { session_id: string; title: string; timestamp: string }[];
  
   
const sortedSessions = grouped.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
setChatSessions(sortedSessions);

    } catch (error) {
      console.error("❌ Failed to load chat history:", error);
    }
  };
  
  
  const loadChatBySession = async (session_id: string) => {
    try {
      const response = await axiosInstance.get(`/api/v1/chat-history/${session_id}`);
      const sessionMessages = response.data.messages;
      const formattedMessages = sessionMessages.flatMap((item: any) => [
        { message: item.user_message, direction: "outgoing", sender: "user" },
        { message: item.ai_response, direction: "incoming", sender: "bot" },
      ]);
      setMessages(formattedMessages);
      setCurrentSessionId(session_id);
    } catch (error) {
      console.error("❌ Failed to load session chat:", error);
    }
  };





  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;
    setIsProcessing(true);

    console.log("User message:", input);
    

    const userMessage: Message = { message: input, direction: "outgoing", sender: "user" };
    setMessages((prevMessages) => [...prevMessages, userMessage]);

    if (input.toLowerCase().includes("log meal")) {
      setShowMealLogForm(true);
      setInput("");
      return;
    }

    try {
     
        if (input.toLowerCase().includes("nutritional info")) {
          const response = await axiosInstance.post("/api/v1/chat", {
            message: input, 
            session_id: currentSessionId,
          });     

            console.log("Nutritional data response:", response.data);

            const botMessage: Message = {
                message: response.data.message || "No nutritional data available.",
                direction: "incoming",
                sender: "bot",
            };

            const detailedMessages: Message[] = (response.data.data || []).map((item: any) => ({
                message: `${item.name} - Calories: ${item.calories}, Protein: ${item.protein}g, Carbs: ${item.carbs}g, Fats: ${item.fats}g`,
                direction: "incoming",
                sender: "bot",
            }));

            setMessages((prevMessages) => [...prevMessages, botMessage, ...detailedMessages]);

        // ✅ Handling Meal Suggestions
        }  else if (
          input.toLowerCase().includes('what should i eat') ||
          input.toLowerCase().includes('next meal') ||
          input.toLowerCase().includes('what should i eat now')||
          input.toLowerCase().includes('current meal')
        ) {
          const apiUrl = "http://127.0.0.1:8000/api/v1/current_meal";
          const response = await axios.post(apiUrl, {
            message: input,
            session_id: currentSessionId,
          }, {
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
            },
          });
          
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              message: response.data.message || "No meal plan available.",
              direction: "incoming",
              sender: "bot",
              source: "Diet Plan API",
            },
          ]);
          
        
  
        } else if (input.toLowerCase().includes("grocery list") || input.toLowerCase().includes("shopping list")) {
            const apiUrl = "http://127.0.0.1:8000/api/v1/grocery-list";
            console.log("Fetching grocery list:", apiUrl);

            const response = await axios.get(apiUrl);
            console.log("Grocery list response:", response.data);

            setMessages((prevMessages) => [
                ...prevMessages,
                { message: "Here is your grocery list:", direction: "incoming", sender: "bot" },
                ...(response.data.list || []).map((item: string) => ({ message: `- ${item}`, direction: "incoming", sender: "bot" })),
            ]);

        
        } else if (input.toLowerCase().includes("update diet plan")) {
          const response = await axios.post("http://127.0.0.1:8000/api/v1/chat", {
            message: input,
            session_id: currentSessionId,
          }, {
            headers: {
              Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
            },
          });
        
          setMessages((prevMessages) => [
            ...prevMessages,
            {
              message: response.data.message || "No response from Spoonacular.",
              direction: "incoming",
              sender: "bot",
            },
          ]);
        }
        
      
        else {
            console.warn("WebSocket not open. Using fallback API.");
            const apiUrl = "http://127.0.0.1:8000/api/v1/chat";
            console.log("Fetching API URL (fallback query):", apiUrl);
            const token = await AsyncStorage.getItem("token");

            const response = await axios.post(
              apiUrl,
              {
                message: input,
                session_id: currentSessionId,
              },
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );
            
            setMessages((prevMessages) => [
                ...prevMessages,
                { message: response.data.message || "No response from AI.", direction: "incoming", sender: "bot" }
            ]);
        }

        

    } catch (error) {
        console.error("Error processing message:", error);
        setMessages((prevMessages) => [
            ...prevMessages,
            { message: "Sorry, something went wrong.", direction: "incoming", sender: "bot" }
        ]);
    } finally {
        setIsProcessing(false);
        setInput("");
    }
};


  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home") } style={styles.backButton}>
        <Text style={styles.backButtonText}>← Back to Home</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.sidebarToggle}
        onPress={() => {
          setIsSidebarOpen(true);
          loadChatHistory();
        }}
      >
        <Ionicons name="menu" size={28} color="#8a2be2" />
      </TouchableOpacity>

      {isSidebarOpen && (
        <ChatHistory
  isLoading={loadingHistory}
  chatHistory={chatSessions}
  onNewChat={() => {
    setCurrentSessionId(uuid.v4() as string);
    setMessages([]);
    setShowMealLogForm(false);
    setIsSidebarOpen(false);
  }}
  onSelectSession={(session_id) => {
    loadChatBySession(session_id);
    setIsSidebarOpen(false);
  }}
  onClose={() => setIsSidebarOpen(false)} 
/>

      )}

      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.messagesContainer}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((item, index) => (
          <View
            key={index}
            style={[styles.messageWrapper, item.sender === "user" ? styles.userMessage : styles.botMessage]}
          >
            <LinearGradient
              colors={item.sender === "user" ? ["#D8BFD8", "#b38eb5"] : ["#D8BFD8", "#a98bb8"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.messageBubble}
            >
              <Text style={styles.messageText}>{item.message}</Text>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="Type your message..."
          placeholderTextColor="#888"
          editable={!isProcessing}
        />
        <TouchableOpacity onPress={handleSend}>
          <LinearGradient
            colors={["#D8BFD8", "#b38eb5"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.sendButton}
          >
            <Text style={styles.sendButtonText}>Send</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};



export default Chat;
