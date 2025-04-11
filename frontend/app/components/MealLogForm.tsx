import React, { useState } from "react";
import { 
  View, Text, TouchableOpacity,
  Alert, ActivityIndicator, TextInput, ScrollView,
  Dimensions,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axiosInstance from "../utils/apiHelper"; 
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator";
import styles from "../styles/MealLogFormstyle";
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<RootStackParamList, "MealLogForm">;

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const mealTypes = [
  { label: 'Breakfast', value: 'Breakfast' },
  { label: 'Lunch', value: 'Lunch' },
  { label: 'Dinner', value: 'Dinner' },
  { label: 'Snack', value: 'Snack' },
];

const windowHeight = Dimensions.get("window").height;

const MealLogForm: React.FC<Props> = ({ route, navigation }) => {
  const { userId } = route.params;
  const [currentDay] = useState<number>(new Date().getDay());
  const [isLogging, setIsLogging] = useState(false);

  const [loggedMeals, setLoggedMeals] = useState([
    { meal: "", reason: "", type: "Breakfast", amount: "", open: false },
  ]);
  const [dietPlanReason, setDietPlanReason] = useState("");

  const addMeal = () => {
    setLoggedMeals([
      ...loggedMeals,
      { meal: "", reason: "", type: "Snack", amount: "", open: false },
    ]);
  };

  const updateMeal = (
    index: number,
    field: "meal" | "reason" | "type" | "amount",
    value: string
  ) => {
    const updatedMeals = [...loggedMeals];
    updatedMeals[index][field] = value;
    setLoggedMeals(updatedMeals);
  };

  const setMealDropdownOpen = (
    index: number,
    open: boolean | ((prevState: boolean) => boolean)
  ) => {
    const updatedMeals = [...loggedMeals];
    const currentState = updatedMeals[index].open;
    updatedMeals[index].open =
      typeof open === "function" ? open(currentState) : open;
    setLoggedMeals(updatedMeals);
  };

  const handleLogDietPlan = async () => {
    try {
      setIsLogging(true);
      const authToken = await AsyncStorage.getItem("token");
      if (!authToken) {
        Alert.alert("Authentication Error", "You must be logged in to log the diet plan.");
        return;
      }
  

      const mealsToLog = loggedMeals.filter((meal) => meal.meal.trim() !== "");
  
      if (mealsToLog.length > 0) {
        const payload = {
          user_id: userId,
          meals: mealsToLog,
        };
  
        await axiosInstance.post("/api/v1/manual-log-meals", payload, {
          headers: { Authorization: `Bearer ${authToken}` },
        });
  
        Alert.alert("Success", "Meals logged successfully!");
        navigation.goBack();
      } else {
        const response = await axiosInstance.post(
          "/api/v1/auto-log-meals",
          { reason: dietPlanReason || "No additional notes" },
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
  
        if (response.status === 200) {
          Alert.alert("Success", "Today's diet plan logged successfully!");
          navigation.goBack();
        } else {
          Alert.alert("Error", "Failed to log the diet plan. Please try again.");
        }
      }
    } catch (error: any) {
      console.error("Error logging meals:", error);
  
      
      const message =
        error?.response?.data?.detail === "Food item not found"
          ? "Please enter a valid food item"
          : error?.response?.data?.detail || "An error occurred while logging your meals. Please try again.";
  
      Alert.alert("Logging Failed", message); 
    } finally {
      setIsLogging(false);
    }
  };
  

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        contentContainerStyle={[styles.container, { minHeight: windowHeight }]}
        bounces={false}
      >
        <Text style={styles.header}>
          Log Your Meal for {daysOfWeek[currentDay]}
        </Text>

        <Text style={styles.label}>Did you follow today's diet plan?</Text>
        <TextInput
          style={styles.input}
          placeholder="Additional notes (optional)"
          value={dietPlanReason}
          onChangeText={setDietPlanReason}
        />


        <LinearGradient colors={['#6a11cb', '#2575fc']} style={styles.gradientButton}>
          <TouchableOpacity
            style={styles.buttonContent}
            onPress={handleLogDietPlan}
            disabled={isLogging}
          >
            {isLogging ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>✔ Followed Diet Plan</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>

        <Text style={styles.label}>Log Your Extra Meals</Text>
        {loggedMeals.map((item, index) => (
          <View key={index} style={styles.mealInputContainer}>
            <DropDownPicker
              open={item.open}
              value={item.type}
              items={mealTypes}
              setOpen={(open) => setMealDropdownOpen(index, open)}
              setValue={(callback: (prev: string) => string) =>
                updateMeal(index, "type", callback(item.type))
              }
              containerStyle={styles.dropdownContainerStyle}
              style={styles.dropdown}
              dropDownContainerStyle={styles.dropdownList}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter meal (e.g., Spaghetti Bolognese)"
              value={item.meal}
              onChangeText={(text) => updateMeal(index, "meal", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Why did you eat this? (optional)"
              value={item.reason}
              onChangeText={(text) => updateMeal(index, "reason", text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Enter amount (e.g., 250g, 1 plate)"
              value={item.amount}
              onChangeText={(text) => updateMeal(index, "amount", text)}
            />
          </View>
        ))}

        <LinearGradient colors={['#fca5a5', '#f87171']} style={styles.gradientButton}>
          <TouchableOpacity style={styles.buttonContent} onPress={addMeal}>
            <Text style={styles.buttonText}>➕ Add Another Meal</Text>
          </TouchableOpacity>
        </LinearGradient>

        <LinearGradient colors={['#f7c3e0', '#e4a0bc']} style={styles.gradientButton}>
          <TouchableOpacity
            style={styles.buttonContent}
            onPress={handleLogDietPlan}
            disabled={isLogging}
          >
            {isLogging ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Submit Meals</Text>
            )}
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </View>
  );
};

export default MealLogForm;
