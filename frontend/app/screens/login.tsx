import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions , Alert } from "react-native";
import { NativeStackScreenProps } from  "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator"; 
import axiosInstance from "../utils/apiHelper"; 
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Feather } from '@expo/vector-icons';
import styles from "../styles/AuthScreen";


type Props = NativeStackScreenProps<RootStackParamList, "Login">;


interface LoginResponse {
  token: string;
  user_id: number;
  has_diet_plan: boolean;

}

const Login: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const handleSubmit = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Email and Password are required.");
      return;
    }
  
    try {

      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user_id");
  
      const response = await axiosInstance.post<LoginResponse>("/auth/login", {
        email,
        password,
      });
      console.log("📩 Login API Response:", response.data);
      console.log("📧 Email:", email);
      console.log("🔑 Password:", password);

  
      if (response.data.token && response.data.user_id) {
        Alert.alert("Success", "Login successful!");
  
     
        await AsyncStorage.setItem("token", response.data.token);
        await AsyncStorage.setItem("user_id", String(response.data.user_id));

        await new Promise((resolve) => setTimeout(resolve, 500));
  
        const storedToken = await AsyncStorage.getItem("token");
        console.log("🔍 Stored Token in AsyncStorage:", storedToken);
  
        if (storedToken) {
          if (response.data.has_diet_plan) {
            navigation.reset({
              index: 0,
              routes: [{ name: "Home" }],
            });
          } else {
            navigation.reset({
              index: 0,
              routes: [{ name: "DietPreferenceForm" }],
            });
          }
        } else {
          Alert.alert("Error", "Token not stored correctly. Please try logging in again.");
        }
      }
    } catch (error: any) {
      console.log("❌ Login Error:", error); 
      const detail = error.response?.data?.detail;
  
      if (Array.isArray(detail)) {
        const combined = detail.map((d: any) => d.msg).join("\n");
        Alert.alert("Error", combined);
      } else if (typeof detail === "string") {
        Alert.alert("Error", detail);
      } else {
        Alert.alert("Error", "Invalid credentials or missing fields.");
      }
    }
  };

  const handleSignOut = async () => {
    try {
      
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user_id");

    
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });

      Alert.alert("Success", "You have been logged out successfully.");
    } catch (error) {
      console.log("❌ Sign-out Error:", error);
      Alert.alert("Error", "An error occurred while signing out. Please try again.");
    }
  };
  
  return (
    <View style={styles.container}>

      <View style={styles.topHalf}>
        <Text style={styles.logo}>
          <Text style={styles.largeLetter}>N</Text>utri
          <Text style={styles.largeLetter}>M</Text>ate
        </Text>
        <Text style={styles.subtitle}>For a healthier you</Text>
      </View>

   
      <View style={styles.card}>
        <Text style={styles.title}>Login Account</Text>

        <TextInput
  placeholder="Enter your email"
  value={email}
  onChangeText={(text) => setEmail(text.toLowerCase())}
  keyboardType="email-address"
  style={styles.input}
  autoCapitalize="none"
/>


<View style={styles.passwordContainer}>
  <TextInput
    placeholder="Password"
    value={password}
    onChangeText={setPassword}
    secureTextEntry={!showPassword}
    style={[styles.input, { paddingRight: 40 }]}
  />
  <TouchableOpacity
    onPress={() => setShowPassword((prev) => !prev)}
    style={styles.eyeIcon}
  >
    <Feather name={showPassword ? "eye" : "eye-off"} size={22} color="#6541A5" />
  </TouchableOpacity>
</View>


<TouchableOpacity onPress={() => navigation.navigate("ResetPassword")}>
        <Text style={styles.footerText}>Forgot password</Text>
      </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Log In</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.footerText}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Login;