import {
    StyleSheet,
    Dimensions ,
    Platform,
  
  } from "react-native";
  import { LinearGradient } from 'expo-linear-gradient';

  const { width } = Dimensions.get("window");
  

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0f0f0f",
      paddingTop: Platform.OS === "android" ? 40 : 0,
    },
  
    backButton: {
      margin: 10,
      padding: 10,
      backgroundColor: "#1f1f1f",
      borderRadius: 10,
      alignSelf: "flex-start",
    },
    backButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "600",
    },
  
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderTopWidth: 1,
      borderColor: "#222",
      backgroundColor: "#121212",
      marginBottom: Platform.OS === "ios" ? 16 : 8,
    },
    messagesContainer: {
        flexGrow: 1,
        paddingHorizontal: 16,
        paddingBottom: 20,
        paddingTop: 10,
      },
      
  
    input: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: "#1e1e1e",
      borderRadius: 30,
      fontSize: 16,
      color: "#ffffff",
      marginRight: 10,
      borderWidth: 1,
      borderColor: "#333",
    },
  
    sendButton: {
      backgroundColor: "#9333ea",
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 30,
      alignItems: "center",
      justifyContent: "center",
    },
  
    sendButtonText: {
      color: "#00",
      fontSize: 16,
      fontWeight: "bold",
    },
    messageWrapper: {
        flexDirection: 'row',
        marginVertical: 8,
        maxWidth: '85%',
      },
      
      userMessage: {
        alignSelf: 'flex-end',
        justifyContent: 'flex-end',
        marginLeft: 40,
      },
      
      botMessage: {
        alignSelf: 'flex-start',
        justifyContent: 'flex-start',
        marginRight: 40,
      },
      
      messageBubble: {
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
      },
      
      messageText: {
        fontSize: 16,
        color: "#1e1e1e",
        lineHeight: 22,
        fontWeight: "500",
      },
    
      
      sidebarToggle: {
        position: "absolute",
        top: 50,
        left: 10,
        zIndex: 999,
      },
      
  });
  

  export default styles;