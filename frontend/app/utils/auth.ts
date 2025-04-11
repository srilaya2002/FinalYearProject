import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";


export const isTokenExpired = (token: string): boolean => {
  try {
    const [, payloadBase64] = token.split(".");
    const payload = JSON.parse(atob(payloadBase64));
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    console.error("Error checking token expiration:", error);
    return true; 
  }
};


export const refreshToken = async (): Promise<string | null> => {
  try {
    const refreshToken = await AsyncStorage.getItem("refresh_token"); 
    if (!refreshToken) {
      console.warn("No refresh token found.");
      return null;
    }

    const response = await axios.post("http://127.0.0.1:8000/api/auth/refresh", {
      refresh_token: refreshToken,
    });

    if (response.data && response.data.token) {
      await AsyncStorage.setItem("token", response.data.token);
      return response.data.token;
    } else {
      console.warn("Failed to refresh token.");
      return null;
    }
  } catch (error) {
    console.error("Error refreshing token:", error);
    return null;
  }
};
