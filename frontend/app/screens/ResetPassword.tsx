import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import axiosInstance from "../utils/apiHelper";
import { RootStackParamList } from "../../navigation/appNavigator";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import styles from "../styles/AuthScreen";

type Props = NativeStackScreenProps<RootStackParamList, "ResetPassword">;



const ResetPassword: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");


  const handleResetPassword = async () => {
    try {
      const payload = { email };
      console.log("🔍 Sending reset request payload:", payload);

      const response = await axiosInstance.post("/auth/reset-password", { email });

      console.log("✅ API Response:", response.data);

      // ✅ Navigate to OTP screen
      navigation.navigate("OtpVerification", {
        email,
        context: "reset-password",
      });
    } catch (error: any) {
      const detail = error?.response?.data?.detail;
    
      if (__DEV__) {
      }
    
 
      if (detail === "Email not registered.") {
        Alert.alert("Error", "Email not registered.");
        return;
      }
    
      if (Array.isArray(detail)) {
        const combined = detail.map((d: any) => d.msg).join("\n");
        Alert.alert("Error", combined);
      } else if (typeof detail === "string") {
        Alert.alert("Error", detail);
      } else {
        Alert.alert("Error", "Something went wrong.");
      }
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
        <Text style={styles.title}>Reset Password</Text>

        <TextInput
  placeholder="Enter your email"
  value={email}
  onChangeText={(text) => setEmail(text.toLowerCase())}
  keyboardType="email-address"
  style={styles.input}
  autoCapitalize="none"
/>


        <TouchableOpacity style={styles.button} onPress={handleResetPassword}>
          <Text style={styles.buttonText}>Send OTP</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
  <Text style={styles.footerText}>← Back to Login</Text>
</TouchableOpacity>


    </View>
    
  );
};

export default ResetPassword;
