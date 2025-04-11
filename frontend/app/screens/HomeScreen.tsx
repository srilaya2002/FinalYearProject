import React from 'react';
import { View, Text, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/appNavigator';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import styles from '../styles/HomeScreenstyle';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  
  const handleSignOut = async () => {
    try {
   
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('user_id');

    
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });

      Alert.alert('Success', 'You have been logged out successfully.');
    } catch (error) {
      console.log('❌ Sign-out Error:', error);
      Alert.alert('Error', 'An error occurred while signing out. Please try again.');
    }
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#ffffff' }} contentContainerStyle={styles.container}>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <View style={styles.cardList}>
        <LinearGradient colors={['#fbc2eb', '#a6c1ee']} style={styles.card}>
          <TouchableOpacity style={styles.cardContent} onPress={async () => {
            try {
              const userId = await AsyncStorage.getItem("user_id");
              if (userId) {
                navigation.navigate('MealLogForm', { userId: Number(userId) });
              } else {
                Alert.alert("Error", "User ID not found. Please log in again.");
              }
            } catch (error) {
              console.error("Error fetching user ID:", error);
            }
          }}>
            <Text style={styles.cardText}>Log Meals</Text>
            <Text style={styles.cardIcon}>🍽️</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient colors={['#89f7fe', '#66a6ff']} style={styles.card}>
          <TouchableOpacity style={styles.cardContent} onPress={() => navigation.navigate('Dashboard')}>
            <Text style={styles.cardText}>Dashboard</Text>
            <Text style={styles.cardIcon}>📊</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient colors={['#f6d365', '#fda085']} style={styles.card}>
          <TouchableOpacity style={styles.cardContent} onPress={() => navigation.navigate('Chat')}>
            <Text style={styles.cardText}>Chat with AI</Text>
            <Text style={styles.cardIcon}>🤖</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient colors={['#96fbc4', '#f9f586']} style={styles.card}>
          <TouchableOpacity style={styles.cardContent} onPress={() => {
            const dietPlanContent = "Sample diet plan content"; 
            navigation.navigate('DietPlanDisplay', { dietPlanContent });
          }}>
            <Text style={styles.cardText}>View Diet Plan</Text>
            <Text style={styles.cardIcon}>🥗</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient colors={['#ff9a9e', '#fecfef']} style={styles.card}>
          <TouchableOpacity style={styles.cardContent} onPress={() => navigation.navigate('MealHistoryScreen')}>
            <Text style={styles.cardText}>Meal History</Text>
            <Text style={styles.cardIcon}>📅</Text>
          </TouchableOpacity>
        </LinearGradient>
      </View>

      {/* Sign Out Button - Positioned at the Top Right */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default HomeScreen;
