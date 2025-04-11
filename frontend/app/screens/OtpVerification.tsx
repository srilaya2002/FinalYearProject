import React, { useState, useEffect  } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import axiosInstance from "../utils/apiHelper";
import styles from "../styles/AuthScreen";



type Props = NativeStackScreenProps<RootStackParamList, "OtpVerification">;

const OtpVerification: React.FC<Props> = ({ route, navigation }) => {
  const { email, context, password } = route.params;
  const [otp, setOtp] = useState<string>("");
  const [timer, setTimer] = useState<number>(30);
  const [resendDisabled, setResendDisabled] = useState<boolean>(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (resendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setResendDisabled(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [resendDisabled]);



  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert("Error", "Please enter the OTP.");
      return;
    }

    try {
      let response;

      console.log("🔍 OTP Verification Request:", { email, otp });

      if (context === "signup") {
        response = await axiosInstance.post("/auth/signup/verify-otp", {
          email,
          otp,
          password, // Required during signup
        });
      } else if (context === "reset-password") {
        response = await axiosInstance.post("/auth/reset-password/verify-otp", {
          email,
          otp,
        });
      } else {
        throw new Error("Invalid OTP context");
      }

      console.log("✅ OTP Verified:", response.data);

      if (context === "signup") {
        Alert.alert("Success", "Account verified. You can now log in.");
        navigation.navigate("Login");
      } else if (context === "reset-password") {
        navigation.navigate("NewPassword", { email }); // Navigate to new password setup
      }
    } catch (error: any) {
      console.error("❌ OTP Verification Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.detail || "Invalid or expired OTP.");
    }
  };


  const handleResendOtp = async () => {
    try {
      if (context === "signup") {
        await axiosInstance.post("/auth/signup", { email, password, confirm_password: password });
      } else {
        await axiosInstance.post("/auth/reset-password", { email });
      }

      setTimer(30);
      setResendDisabled(true);
      Alert.alert("OTP Sent", "A new OTP has been sent to your email.");
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.detail || "Failed to resend OTP.");
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
        <Text style={styles.title}>Enter the OTP sent to your email</Text>

        <TextInput
          placeholder="6-digit OTP"
          value={otp}
          onChangeText={setOtp}
          keyboardType="numeric"
          style={styles.input}
          maxLength={6}
        />

        <TouchableOpacity style={styles.button} onPress={handleVerifyOtp}>
          <Text style={styles.buttonText}>Verify OTP</Text>
        </TouchableOpacity>
      </View>

      <View style={{ width: "100%", alignItems: "center", marginTop: 10 }}>
  <TouchableOpacity onPress={handleResendOtp} disabled={resendDisabled}>
    <Text
      style={{
        color: resendDisabled ? "#999" : "#6541A5",
        fontSize: 14,
        fontWeight: "500",
      }}
    >
      {resendDisabled ? `Resend OTP in ${timer}s` : "Resend OTP"}
    </Text>
  </TouchableOpacity>
  <TouchableOpacity
  style={styles.backButton}
  onPress={() => {
    if (context === "signup") {
      navigation.navigate("Signup");
    } else {
      navigation.navigate("ResetPassword");
    }
  }}
>
  <Text style={styles.backButtonText}>← Back</Text>
</TouchableOpacity>


</View>

    </View>
  );
};



export default OtpVerification;
