
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Alert } from "react-native";
import { isTokenExpired, refreshToken } from "./auth";
import { API_BASE_URL } from "./config"; 

const MAX_RETRIES = 5;
let retryCount = 0;
let socket: WebSocket | null = null;

export const initializeWebSocket = async (
    setMessages: Function,
    setSocket: Function,
    navigation: any
) => {
    let token = await AsyncStorage.getItem("token");

    console.log("🔍 Token Before WebSocket Connects:", token);

    if (!token || isTokenExpired(token)) {
        console.log("Token Expired! Attempting to Refresh...");
        token = await refreshToken();

        if (!token) {
            console.error("Failed to refresh token! Redirecting to Login.");
            Alert.alert("Error", "Session expired. Please log in again.");
            navigation.navigate("Login");
            return;
        }

        console.log("New Token After Refresh:", token);
        await AsyncStorage.setItem("token", token);
    }

    console.log(" Connecting WebSocket with Token:", token);
    const websocketURL = API_BASE_URL.replace(/^http/, 'ws');
socket = new WebSocket(`${websocketURL}/ws?token=${token}`);


    socket.onopen = () => {
        console.log("WebSocket connection established.");
        retryCount = 0;
    };

    socket.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            setMessages((prevMessages: any) => [
                ...prevMessages,
                { message: data.message || "Unknown response", direction: "incoming", sender: "bot" },
            ]);
        } catch (err) {
            console.error("Error parsing WebSocket message:", err);
        }
    };

    socket.onclose = (event) => {
        console.warn(` WebSocket closed with code: ${event.code}, reason: ${event.reason}`);
        
        if (retryCount < MAX_RETRIES) {
            retryCount += 1;
            console.log(` Attempting to reconnect... (${retryCount}/${MAX_RETRIES})`);
            setTimeout(() => initializeWebSocket(setMessages, setSocket, navigation), 3000);
        } else {
            console.error("Maximum reconnection attempts reached. Not reconnecting.");
            Alert.alert("WebSocket Error", "Unable to reconnect to the server. Please try again later.");
        }
    };

    socket.onerror = (event) => {
        console.error("WebSocket error:", event);
        Alert.alert("WebSocket Error", "An error occurred with the connection.");
        socket?.close(); 
    };

    setSocket(socket);
};


export const closeWebSocket = () => {
    if (socket) {
        console.log("Closing WebSocket connection");
        socket.close(1000, "Component unmounted");
        socket = null;
    }
};
