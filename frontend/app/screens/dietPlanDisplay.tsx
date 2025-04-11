import React, { useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import axiosInstance from "../utils/apiHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DietPlanDisplay = ({ navigation }: any) => {
  const [dietPlan, setDietPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDietPlan = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        const userId = await AsyncStorage.getItem("user_id");
        if (!token || !userId) {
          setError("User is not logged in.");
          setLoading(false);
          navigation.replace("Login");
          return;
        }

        const response = await axiosInstance.get(`/api/v1/diet-plan?user_id=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.diet_plan) {
          let parsedPlan;
          try {

            if (typeof response.data.diet_plan === "string") {
              const firstParse = JSON.parse(response.data.diet_plan);
              if (typeof firstParse === "string") {
                parsedPlan = JSON.parse(firstParse);
              } else {
                parsedPlan = firstParse;
              }
            } else if (typeof response.data.diet_plan === "object") {
              parsedPlan = response.data.diet_plan;
            } else {
              throw new Error("Unexpected diet plan format.");
            }

            if (parsedPlan && parsedPlan.week && typeof parsedPlan.week === "object") {
              setDietPlan(parsedPlan);
            } else {
              throw new Error("Diet plan does not contain a valid 'week' structure.");
            }
          } catch (parseError) {
            setError("Failed to parse diet plan. Invalid JSON format.");
          }
        } else {
          throw new Error("No diet plan found.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load diet plan.");
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlan();
  }, [navigation]);

  if (loading) return <Text>Loading your diet plan...</Text>;
  if (error) return <Text style={{ color: "red" }}>{error}</Text>;

  if (!dietPlan || !dietPlan.week) {
    return <Text>No valid diet plan found.</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Weekly Diet Plan</Text>

      {Object.entries(dietPlan.week).map(([day, data]: [string, any]) => (
        <View key={day} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day.charAt(0).toUpperCase() + day.slice(1)}</Text>

          {data.nutrients ? (
            <Text style={styles.nutritionText}>
              Calories: {data.nutrients.calories} kcal | Protein: {data.nutrients.protein}g | 
              Fat: {data.nutrients.fat}g | Carbs: {data.nutrients.carbohydrates}g
            </Text>
          ) : (
            <Text style={{ color: "red" }}>Nutritional information not available.</Text>
          )}

          {Array.isArray(data.meals) && data.meals.length > 0 ? (
            data.meals.map((meal: any, index: number) => (
              <View key={index} style={styles.mealContainer}>
            
                <Text style={styles.mealTitle}>{meal.title}</Text>
                <Text>Prep Time: {meal.readyInMinutes} minutes</Text>
                <Text>Servings: {meal.servings}</Text>
                <TouchableOpacity onPress={() => navigation.navigate("WebViewScreen", { url: meal.sourceUrl })}>
                  <Text style={styles.recipeLink}>View Recipe</Text>
                </TouchableOpacity>
              </View>
            ))
          ) : (
            <Text>No meals found for {day}.</Text>
          )}
        </View>
      ))}


    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFFFF", 
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A4A4A", 
    textAlign: "center",
    marginBottom: 30,
  },
  dayContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#E8E8F1", 
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D1C4E9", 
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5, 
  },
  dayTitle: {
    fontSize: 22,
    fontWeight: "600",
    color: "#4A4A4A", 
    marginBottom: 10,
  },
  nutritionText: {
    fontSize: 14,
    color: "#5D5D5D", 
    marginBottom: 10,
  },
  mealContainer: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#FFFFFF", 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0", 
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2, 
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333333", 
    marginBottom: 5,
  },
  mealText: {
    fontSize: 14,
    color: "#5D5D5D", 
    marginBottom: 5,
  },
  recipeLink: {
    color: "#007AFF", 
    fontSize: 16,
    fontWeight: "500",
    paddingVertical: 8,
    textAlign: "center",
    backgroundColor: "#F0F8FF", 
    borderRadius: 6,
    marginTop: 10,
  },
  backButton: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: "#007AFF", 
    borderRadius: 10,
    alignSelf: "flex-start",
  },

});


export default DietPlanDisplay;
