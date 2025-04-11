import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "./config"; 


const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");
    console.log("🔍 Token Retrieved by Axios Interceptor:", token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("✅ Axios Interceptor - Token Added to Headers:", config.headers.Authorization);
    }else {
      console.warn("⚠️ No token found in AsyncStorage");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Token expired. Logging out...");
      await AsyncStorage.removeItem("token");
  
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
