import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Modal, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator"; 
import axios from "axios";
import { Feather } from '@expo/vector-icons';
import styles from "../styles/AuthScreen";

type Props = NativeStackScreenProps<RootStackParamList, "Signup">;

const Signup: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [reenterPassword, setReenterPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showReenterPassword, setShowReenterPassword] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false); 
  const [showTermsModal, setShowTermsModal] = useState(false);  

  const handleSignup = async () => {
    console.log("Signup button pressed.");
    console.log("Email:", email);
    console.log("Passwords match:", password === reenterPassword);

    if (!email || !password || !reenterPassword) {
        Alert.alert("Error", "All fields are required.");
        return;
    }

    if (password !== reenterPassword) {
        Alert.alert("Error", "Passwords do not match.");
        return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
        Alert.alert("Error", "Invalid email format.");
        return;
    }

    if (!termsChecked) {
        Alert.alert("Error", "You must agree to the terms and conditions.");
        return;
    }

    try {
      console.log("Sending signup request with:", { email, password, confirm_password: reenterPassword });
      const response = await axios.post("http://127.0.0.1:8000/auth/signup", {
          email,
          password,
          confirm_password: reenterPassword,
      }, {
          headers: {
              "Content-Type": "application/json",
          }
      });
      console.log("Signup Response:", response.data);
      Alert.alert("Success", "Signup successful! Please verify your email.");
      navigation.navigate("OtpVerification", {
        email,
        password,
        context: "signup", // ✅ REQUIRED
      });
      
  } catch (error: any) {
      console.error("Signup Error:", error.response?.data || error.message);
      Alert.alert("Error", error.response?.data?.detail || "Signup failed.");
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
        <Text style={styles.title}>Sign Up</Text>
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

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Re-enter Password"
            value={reenterPassword}
            onChangeText={setReenterPassword}
            secureTextEntry={!showReenterPassword}
            style={[styles.input, { paddingRight: 40 }]}
          />
          <TouchableOpacity
            onPress={() => setShowReenterPassword((prev) => !prev)}
            style={styles.eyeIcon}
          >
            <Feather name={showReenterPassword ? "eye" : "eye-off"} size={22} color="#6541A5" />
          </TouchableOpacity>
        </View>


        <View style={styles.termsContainer}>
          <TouchableOpacity onPress={() => setTermsChecked(!termsChecked)} style={styles.checkbox}>
            <Feather name={termsChecked ? "check-square" : "square"} size={22} color="#6541A5" />
          </TouchableOpacity>
          <Text style={styles.termsText}>
            I agree to the 
            <Text 
              style={styles.linkText} 
              onPress={() => setShowTermsModal(true)}>
              {" "}Terms and Conditions
            </Text>
          </Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignup}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
      </View>

 
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.footerText}>Already have an account? Log In</Text>
      </TouchableOpacity>


      <Modal
        visible={showTermsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowTermsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView>
              <Text style={styles.modalTitle}>Terms and Conditions</Text>
              <Text style={styles.modalText}>
              By using the NutriMate app, you acknowledge that this app is intended to assist with basic nutritional tracking and provide general dietary guidance. However, the content and recommendations provided by this app are not intended to replace professional medical or dietary advice.

Please consult with a healthcare provider before making any significant changes to your diet or exercise regimen based on the information provided by NutriMate. The app is not liable for any health issues, side effects, or injuries resulting from its use.

While we strive to provide accurate information, NutriMate cannot guarantee the accuracy, reliability, or suitability of the dietary suggestions, and you should use the app responsibly and with caution.

By continuing to use NutriMate, you agree to not hold the app developers or affiliated parties liable for any consequences, health-related or otherwise, arising from your use of the app.

Remember, your health and well-being are your responsibility.
              </Text>
            </ScrollView>
            <TouchableOpacity 
              onPress={() => setShowTermsModal(false)} 
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Signup;
