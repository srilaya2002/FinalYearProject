import React from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

type Props = {
    isLoading: boolean;
    chatHistory: {
      session_id: string;
      title: string;
      timestamp: string;
    }[];
    onNewChat: () => void;
    onSelectSession: (session_id: string) => void; 
    onClose: () => void;
  };

const ChatHistory: React.FC<Props> = ({ isLoading, chatHistory, onNewChat, onSelectSession, onClose  }) => {
  return (
    <View style={styles.sidebar}>
      <Text style={styles.sidebarTitle}>Chat History</Text>

      <TouchableOpacity style={styles.newChatBtn} onPress={onNewChat}>
        <Text style={styles.newChatText}>+ New Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.newChatBtn} onPress={onClose}>
  <Text style={styles.newChatText}>✕ Close</Text>
</TouchableOpacity>



      {isLoading ? (
        <ActivityIndicator size="small" color="#8a2be2" />
      ) : (
        <FlatList
  data={chatHistory}
  keyExtractor={(item) => item.session_id}
  renderItem={({ item }) => (
    <TouchableOpacity onPress={() => onSelectSession(item.session_id)}>
      <View style={styles.historyItem}>
        <Text numberOfLines={1} style={styles.historyText}>
          {item.title}
        </Text>
        <Text style={{ fontSize: 10, color: "#999" }}>
          {new Date(item.timestamp).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  )}
/>

      )}
    </View>
  );
};

export default ChatHistory;

const styles = StyleSheet.create({
  sidebar: {
    position: "absolute",
    top: 100,
    left: 0,
    width: "70%",
    height: "80%",
    backgroundColor: "#f4f0f8",
    padding: 15,
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 998,
  },
  sidebarTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#4B0082",
  },
  newChatBtn: {
    backgroundColor: "#b38eb5",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  newChatText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
  historyItem: {
    paddingVertical: 6,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  historyText: {
    fontSize: 14,
    color: "#444",
  },
});
