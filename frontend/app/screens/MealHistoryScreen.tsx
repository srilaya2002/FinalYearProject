// MealHistoryScreen.tsx
import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axiosInstance from '../utils/apiHelper';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/appNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'MealHistoryScreen'>;

interface Meal {
  meal_name: string;
  meal_type: string;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  extra_meal_reason?: string;
}

const MealHistoryScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMeals = async (date: string) => {
    const userId = await AsyncStorage.getItem('user_id');
    if (!userId) return;

    setLoading(true);
    try {
      const response = await axiosInstance.get(`/api/v1/meal-history/${userId}/${date}`);
      setMeals(response.data.meals);
    } catch (error) {
      console.error("Error fetching meals:", error);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const onDateSelect = (day: any) => {
    setSelectedDate(day.dateString);
    fetchMeals(day.dateString);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.innerContainer}>
        <Calendar
          onDayPress={onDateSelect}
          markedDates={{ [selectedDate]: { selected: true, selectedColor: '#66a6ff' } }}
        />

        {loading && <ActivityIndicator style={styles.loading} size="large" color="#66a6ff" />}

        {!loading && selectedDate !== '' && (
          meals.length > 0 ? (
            meals.map((meal, index) => (
              <LinearGradient
                key={index}
                colors={['#fbc2eb', '#a6c1ee']}
                style={styles.card}
              >
                <View style={styles.cardContent}>
                  <Text style={styles.mealText}>
                    {meal.meal_name} ({meal.meal_type})
                  </Text>

                  {meal.extra_meal_reason && (
                    <Text style={styles.reasonText}>
                      Reason: {meal.extra_meal_reason}
                    </Text>
                  )}
                </View>
              </LinearGradient>
            ))
          ) : (
            <Text style={styles.noMealsText}>
              No meals logged for this day.
            </Text>
          )
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  innerContainer: {
    padding: 20,
  },
  loading: {
    marginTop: 20,
  },
  card: {
    borderRadius: 12,
    marginVertical: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  cardContent: {
    flexDirection: 'column',
  },
  mealText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  reasonText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    flexWrap: 'wrap',
  },
  noMealsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#777',
  },
});

export default MealHistoryScreen;
