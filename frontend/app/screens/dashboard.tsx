import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LineChart, PieChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import axiosInstance from "../utils/apiHelper";

const screenWidth = Dimensions.get("window").width;

const Dashboard = ({ navigation }: any) => {
  const [nutritionData, setNutritionData] = useState<any>(null);
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState<"day" | "week">("day");

  const fetchData = async (range: "day" | "week") => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem("user_id");
      if (!userId) {
        setError("User ID not found.");
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get(
        `/api/v1/nutrition-summary?range_type=${range}&detailed=${range === "week"}`
      );
      setNutritionData(response.data);

      if (range === "day") {
        const insightRes = await axiosInstance.post(
          "/api/v1/generate-nutrition-summary",
          {
            user_id: parseInt(userId),
            nutrition_data: {
              calories: response.data.calories,
              protein: response.data.protein,
              carbs: response.data.carbs,
              fats: response.data.fats,
            },
          }
        );
        setInsights(insightRes.data.summary);
      } else {
        const graphInsightRes = await axiosInstance.post(
          "/api/v1/generate-weekly-nutrition-summary",
          {
            user_id: parseInt(userId),
            bmi: response.data.bmi,
            diet_goal: response.data.diet_goal,
            weekly_data: response.data.weekly_data.map((entry: any) => ({
              day: entry.day,
              calories: entry.calories,
              target: 1800,
              protein: entry.protein,
              carbs: entry.carbs,
              fat: entry.fat,
            })),
          }
        );
        setInsights(graphInsightRes.data.graph_insight);
      }
    } catch (err: any) {
      console.error("Error fetching dashboard data:", err);
      const backendError = err?.response?.data?.detail || "Something went wrong.";
      setError(backendError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedRange);
  }, [selectedRange]);

  if (loading) return <Text style={styles.loading}>Loading your dashboard...</Text>;
  if (error) return <Text style={styles.error}>{error}</Text>;
  if (!nutritionData) return <Text style={styles.loading}>No data available.</Text>;

  const calories =
    selectedRange === "day"
      ? nutritionData?.calories
      : nutritionData?.weekly_data?.reduce((acc: any, val: any) => acc + val.calories, 0).toFixed(0);

  const protein =
    selectedRange === "day"
      ? nutritionData?.protein
      : nutritionData?.weekly_data?.reduce((acc: any, val: any) => acc + val.protein, 0).toFixed(0);

  const carbs =
    selectedRange === "day"
      ? nutritionData?.carbs
      : nutritionData?.weekly_data?.reduce((acc: any, val: any) => acc + val.carbs, 0).toFixed(0);

  const fats =
    selectedRange === "day"
      ? nutritionData?.fats
      : nutritionData?.weekly_data?.reduce((acc: any, val: any) => acc + val.fat, 0).toFixed(0);

  const safeParse = (val: any) => {
    const num = parseFloat(val);
    return isNaN(num) ? 0 : num;
  };

  const pieData = [
    {
      name: "Protein",
      population: safeParse(protein),
      color: "#6a5acd",
      legendFontColor: "#333",
      legendFontSize: 15,
    },
    {
      name: "Carbs",
      population: safeParse(carbs),
      color: "#20b2aa",
      legendFontColor: "#333",
      legendFontSize: 15,
    },
    {
      name: "Fats",
      population: safeParse(fats),
      color: "#ffa500",
      legendFontColor: "#333",
      legendFontSize: 15,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#4B0082" />
        <Text style={styles.backText}>Back to Home</Text>
      </TouchableOpacity>

      <Text style={styles.header}>Your Nutrition Dashboard</Text>

      <View style={styles.card}>
        <View style={styles.caloriesCircle}>
          <Text style={styles.caloriesText}>{calories}</Text>
          <Text style={styles.caloriesLabel}>
            Total {selectedRange === "day" ? "Today's" : "Weekly"} Calories
          </Text>
        </View>

        <PieChart
          data={pieData}
          width={screenWidth - 40}
          height={220}
          chartConfig={{
            backgroundColor: "#ffffff",
            backgroundGradientFrom: "#ffffff",
            backgroundGradientTo: "#ffffff",
            color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            strokeWidth: 2,
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />

        <View style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setSelectedRange("day")}
            style={[styles.toggleButton, selectedRange === "day" && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleButtonText, selectedRange === "day" && styles.toggleButtonTextActive]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setSelectedRange("week")}
            style={[styles.toggleButton, selectedRange === "week" && styles.toggleButtonActive]}
          >
            <Text style={[styles.toggleButtonText, selectedRange === "week" && styles.toggleButtonTextActive]}>Weekly</Text>
          </TouchableOpacity>
        </View>
      </View>


      {selectedRange === "week" && nutritionData.weekly_data && (
        <View style={styles.weeklyCard}>
          <Text style={styles.weeklyTitle}>Weekly Nutrition Overview</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <LineChart
              data={{
                labels: nutritionData.weekly_data.map((d: any) => d.day),
                datasets: [
                  {
                    data: nutritionData.weekly_data.map((d: any) => Number(d.calories) || 0),
                    strokeWidth: 2,
                    color: () => "#FF6384",
                  },
                  {
                    data: nutritionData.weekly_data.map((d: any) => Number(d.protein) || 0),
                    strokeWidth: 2,
                    color: () => "#36A2EB",
                  },
                  {
                    data: nutritionData.weekly_data.map((d: any) => Number(d.carbs) || 0),
                    strokeWidth: 2,
                    color: () => "#FFCE56",
                  },
                  {
                    data: nutritionData.weekly_data.map((d: any) => Number(d.fat) || 0),
                    strokeWidth: 2,
                    color: () => "#4BC0C0",
                  },
                ],
              }}
              width={screenWidth * 1.5}
              height={320}
              chartConfig={{
                backgroundColor: "#fff",
                backgroundGradientFrom: "#fff",
                backgroundGradientTo: "#fff",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                labelColor: () => "#4B0082",
                style: { borderRadius: 16 },
                propsForDots: {
                  r: "3",
                  strokeWidth: "1",
                  stroke: "#4B0082",
                },
              }}
              bezier
              style={{ marginVertical: 12, borderRadius: 16 }}
            />
          </ScrollView>

          <View style={styles.legendContainer}>
            <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: "#FF6384" }]} /><Text>Calories</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: "#36A2EB" }]} /><Text>Protein</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: "#FFCE56" }]} /><Text>Carbs</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendColor, { backgroundColor: "#4BC0C0" }]} /><Text>Fats</Text></View>
          </View>
        </View>
      )}

      {insights && (
        <View style={styles.insightCard}>
          <Text style={styles.insightTitle}>Insights</Text>
          <Text style={styles.insightText}>{insights}</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#D8BFD8", paddingHorizontal: 20, paddingTop: 50 },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 20 },
  backText: { fontSize: 16, color: "#4B0082", marginLeft: 5 },
  header: { fontSize: 28, fontWeight: "bold", color: "#4B0082", textAlign: "center", marginBottom: 25 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 20, marginBottom: 30, elevation: 6, alignItems: "center" },
  caloriesCircle: { width: 160, height: 160, borderRadius: 80, backgroundColor: "#ff6347", justifyContent: "center", alignItems: "center", marginBottom: 20 },
  caloriesText: { fontSize: 32, fontWeight: "bold", color: "white" },
  caloriesLabel: { fontSize: 16, color: "white" },
  toggleContainer: { flexDirection: "row", marginTop: 20, justifyContent: "center" },
  toggleButton: { paddingVertical: 10, paddingHorizontal: 20, marginHorizontal: 10, borderRadius: 20, borderWidth: 1, borderColor: "#4B0082" },
  toggleButtonActive: { backgroundColor: "#4B0082" },
  toggleButtonText: { fontSize: 16, color: "#4B0082" },
  toggleButtonTextActive: { color: "white", fontWeight: "bold" },
  insightCard: { backgroundColor: "#ffffff", borderRadius: 12, padding: 20, marginBottom: 40, elevation: 3 },
  insightTitle: { fontSize: 20, fontWeight: "bold", color: "#4B0082", marginBottom: 10 },
  insightText: { fontSize: 16, color: "#555", lineHeight: 22 },
  loading: { fontSize: 18, textAlign: "center", marginTop: 50, color: "#4B0082" },
  error: { fontSize: 16, color: "red", textAlign: "center", marginTop: 40 },
  weeklyCard: { backgroundColor: "#ffffff", borderRadius: 16, padding: 20, marginBottom: 30, elevation: 4 },
  weeklyTitle: { fontSize: 20, fontWeight: "bold", color: "#4B0082", marginBottom: 10, textAlign: "center" },
  legendContainer: { flexDirection: "row", justifyContent: "space-around", marginTop: 10, flexWrap: "wrap" },
  legendItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  legendColor: { width: 12, height: 12, borderRadius: 6, marginRight: 6 },
});

export default Dashboard;
