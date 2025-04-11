
import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Dimensions } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import axiosInstance from "../utils/apiHelper";
import { Feather } from '@expo/vector-icons';
import styles from "../styles/NewPasswordScreen";

const { width, height } = Dimensions.get("window");

type Props = NativeStackScreenProps<RootStackParamList, "NewPassword">;

const NewPassword: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword1, setShowPassword1] = useState(false);
const [showPassword2, setShowPassword2] = useState(false);


  const handleSetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill all fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const response = await axiosInstance.post("/auth/reset-password/set-new", {
        email,
        new_password: newPassword,
      });

      console.log("✅ Password Reset:", response.data);
      Alert.alert("Success", "Password updated successfully.");
      navigation.navigate("Login");
    } catch (error: any) {
      console.error("❌ Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.detail || "Password reset failed.");
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
        <Text style={styles.title}>Set New Password</Text>

        <View style={styles.passwordContainer}>
  <TextInput
    placeholder="New Password"
    secureTextEntry={!showPassword1}
    value={newPassword}
    onChangeText={setNewPassword}
    style={styles.inputWithIcon}
  />
  <TouchableOpacity onPress={() => setShowPassword1(!showPassword1)}>
    <Feather name={showPassword1 ? "eye" : "eye-off"} size={22} color="#6541A5" />
  </TouchableOpacity>
</View>


<View style={styles.passwordContainer}>
  <TextInput
    placeholder="Confirm New Password"
    secureTextEntry={!showPassword2}
    value={confirmPassword}
    onChangeText={setConfirmPassword}
    style={styles.inputWithIcon}
  />
  <TouchableOpacity onPress={() => setShowPassword2(!showPassword2)}>
    <Feather name={showPassword2 ? "eye" : "eye-off"} size={22} color="#6541A5" />
  </TouchableOpacity>
</View>


        <TouchableOpacity style={styles.button} onPress={handleSetPassword}>
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
  style={styles.bottomBackButton}
  onPress={() => navigation.navigate("Login")}
>
  <Text style={styles.bottomBackText}>← Back</Text>
</TouchableOpacity>


    </View>
  );
};



export default NewPassword;
