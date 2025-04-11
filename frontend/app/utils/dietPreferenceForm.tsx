import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import SelectDropdown from "react-native-select-dropdown";
import axiosInstance from "./apiHelper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Animatable from "react-native-animatable";
import styles from "../styles/DietPreferenceForm.styles"; 

const DietPreferenceForm = ({ navigation }: any) => {
  const [step, setStep] = useState(0);
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");
  const [dietType, setDietType] = useState("");
  const [dietGoal, setDietGoal] = useState("");
  const [skipStep7, setSkipStep7] = useState(false);
  const [activityLevel, setActivityLevel] = useState("");
  const [budget, setBudget] = useState("");
  const [allergens, setAllergens] = useState<string[]>([]);
  const [otherAllergen, setOtherAllergen] = useState("");
  const [lactoseFreeOk, setLactoseFreeOk] = useState("yes");
  const [showLactose, setShowLactose] = useState(false);
  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiWarning, setBmiWarning] = useState('');


  useEffect(() => {
    setShowLactose(allergens.includes("lactose_intolerant"));
  }, [allergens]);

  const handleNext = () => {
    switch (step) {
      case 0:
        const parsedAge = parseInt(age);
        if (!age.trim()) return alert("Please enter your age.");
        if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 120) {
          return alert("❌ Invalid age: Age must be between 5 and 120 years.");
        }
        break;
  
      case 1:
        if (!gender.trim()) return alert("Please select your gender.");
        break;
  
      case 2:
        const parsedFeet = parseInt(heightFeet);
        const parsedInches = parseInt(heightInches);
        if (!heightFeet.trim() || !heightInches.trim()) return alert("Please enter your full height.");
        if (isNaN(parsedFeet) || parsedFeet < 2 || parsedFeet > 8) {
          return alert("❌ Invalid height: Height (feet) must be between 2 and 8.");
        }
        if (isNaN(parsedInches) || parsedInches < 0 || parsedInches > 11) {
          return alert("❌ Invalid height: Inches must be between 0 and 11.");
        }
        break;
  
      case 3:
        const parsedWeight = parseFloat(weight);
        if (!weight.trim()) return alert("Please enter your weight.");
        if (isNaN(parsedWeight) || parsedWeight < 20 || parsedWeight > 300) {
          return alert("❌ Invalid weight: Weight must be between 20kg and 300kg.");
        }
        break;
  
      case 4:
        if (!dietType.trim()) return alert("Please select your diet type.");
        break;
  
      case 5:
        if (!budget.trim()) return alert("Please select your budget.");
        break;
  
      case 8:
        if (!activityLevel.trim()) return alert("Please select your activity level.");
        break;
  
      case 9:
        if (!dietGoal.trim()) return alert("Please select your diet goal.");
        break;
    }
  
    if (step === 6) {
      const showOther = allergens.includes("other");
      const showLactose = allergens.includes("lactose_intolerant");
      const shouldShowStep7 = showOther || showLactose;
      setSkipStep7(!shouldShowStep7);
      setStep((prev) => prev + (shouldShowStep7 ? 1 : 2));
      return;
    }
  
    if (step === 7 && skipStep7) {
      if (!activityLevel.trim()) return alert("Please select your activity level.");
      setStep((prev) => prev + 1);
      return;
    } else if (step === 8 && !skipStep7) {
      if (!activityLevel.trim()) return alert("Please select your activity level.");
      setStep((prev) => prev + 1);
      return;
    }
  
    const maxStep = skipStep7 ? 9 : 10;
    if (step >= maxStep) return;
  
    setStep((prev) => prev + 1);
  };
  

  const handleBack = () => {
    if (step === 8 && skipStep7) {
      setStep(6); 
    } else {
      setStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const getDisplayedStep = () => {
    if (skipStep7 && step > 6) return step - 1; 
    return step;
  };

  const isFinalStep = step===9;


  const activityLevels = [
    { value: "sedentary", label: "Sedentary (little or no exercise)" },
    { value: "lightly_active", label: "Lightly Active (1-3 days/week)" },
    { value: "moderately_active", label: "Moderately Active (3-5 days/week)" },
    { value: "very_active", label: "Very Active (6-7 days/week)" },
    { value: "super_active", label: "Super Active (physical job)" },
  ];

  const dietGoals = [
    { value: "muscle_building", label: "Muscle Building" },
    { value: "weight_loss", label: "Weight Loss" },
    { value: "weight_gain", label: "Weight Gain" },
    { value: "maintain_weight", label: "Maintain Weight" },
    { value: "increase_energy", label: "Increase Energy Levels" },
    { value: "overall_health", label: "Improve Overall Health" },
    { value: "active_lifestyle", label: "Support Active Lifestyle" },
  ];

  const renderDropdown = (
    data: string[],
    selected: string,
    onSelect: (val: string) => void,
    placeholder: string
  ) => (
    <SelectDropdown
      data={data}
      onSelect={onSelect}
      renderButton={() => (
        <View style={styles.dropdownButton}>
          <Text style={styles.dropdownButtonText}>
            {selected || placeholder}
          </Text>
        </View>
      )}
      renderItem={(item: string, index: number, isSelected: boolean) => (
        <View style={styles.dropdownItem}>
          <Text style={[styles.dropdownItemText, isSelected && styles.selectedItem]}>
            {item}
          </Text>
        </View>
      )}
      dropdownStyle={styles.dropdownList}
    />
  );
  

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.label}>What's your age?</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              placeholder="Enter your age"
            />
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.label}>What's your gender?</Text>
            {renderDropdown(["Male", "Female", "Other"], gender, setGender, "Select Gender")}
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.label}>Your height (feet & inches)</Text>
            <TextInput style={styles.input} placeholder="Feet" value={heightFeet} onChangeText={setHeightFeet} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Inches" value={heightInches} onChangeText={setHeightInches} keyboardType="numeric" />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.label}>What's your weight (kg)?</Text>
            <TextInput style={styles.input} value={weight} onChangeText={setWeight} keyboardType="numeric" placeholder="Enter weight" />
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.label}>Select your diet type</Text>
            {renderDropdown(["Vegetarian", "Non-Vegetarian", "Vegan"], dietType, setDietType, "Select Diet")}
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.label}>What's your budget?</Text>
            {renderDropdown(["Low", "Medium", "High"], budget, setBudget, "Select Budget")}
          </>
        );

        case 6:
  const allergenData = [
    { key: "lactose_intolerant", value: "Lactose Intolerance" },
    { key: "eggs", value: "Eggs" },
    { key: "peanuts", value: "Peanuts" },
    { key: "tree_nuts", value: "Tree Nuts" },
    { key: "fish", value: "Fish" },
    { key: "shellfish", value: "Shellfish" },
    { key: "wheat", value: "Wheat (Gluten)" },
    { key: "soy", value: "Soy" },
    { key: "sesame", value: "Sesame" },
    { key: "celery", value: "Celery" },
    { key: "mustard", value: "Mustard" },
    { key: "lupin", value: "Lupin" },
    { key: "molluscs", value: "Molluscs" },
    { key: "sulphur_dioxide", value: "Sulphur Dioxide (Sulphites)" },
    { key: "other", value: "Other (Specify Below)" }
  ].filter(item => !(dietType === "Vegan" && item.key === "lactose_intolerant"));

  const handleSubmit = () => {
    if (!bmi || !dietGoal) return;
  
    
    if (bmi >= 40 && dietGoal === 'weight loss') {
      setBmiWarning("You may need medical advice before starting weight loss.");
      return;
    }
    if (bmi < 16 && dietGoal === 'weight gain') {
      setBmiWarning("Extreme underweight. Seek medical guidance first.");
      return;
    }
    if (bmi >= 30 && dietGoal === 'muscle building') {
      setBmiWarning("Muscle building is not ideal with high BMI. Try weight loss first.");
      return;
    }
    if (bmi < 18.5 && dietGoal === 'muscle building') {
      setBmiWarning("Gaining weight first may be better before building muscle.");
      return;
    }
  

    setBmiWarning('');

  };

  return (
    <>
      <Text style={styles.label}>Select Allergies</Text>
      <View style={styles.allergenGrid}>
        {allergenData.map((item) => {
          const isSelected = allergens.includes(item.key);
          return (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.allergenOption,
                isSelected && styles.allergenOptionSelected,
              ]}
              onPress={() => {
                if (isSelected) {
                  setAllergens(allergens.filter((a) => a !== item.key));
                } else {
                  setAllergens([...allergens, item.key]);
                }
              }}
            >
              <Text
                style={[
                  styles.allergenOptionText,
                  isSelected && styles.allergenOptionTextSelected,
                ]}
              >
                {item.value}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </>
  );

      
  case 7:
    return (
      <>
        {allergens.includes("other") && (
          <>
            <Text style={styles.label}>Specify Other Allergens</Text>
            <TextInput
              style={styles.input}
              value={otherAllergen}
              onChangeText={setOtherAllergen}
              placeholder="Enter other allergens"
            />
          </>
        )}
        {allergens.includes("lactose_intolerant") && (
          <>
            <Text style={styles.label}>Can you consume lactose-free dairy?</Text>
            {renderDropdown(["Yes", "No"], lactoseFreeOk, setLactoseFreeOk, "Select Option")}
          </>
        )}
      </>
    );
  
      case 8:
        return (
          <>
            <Text style={styles.label}>What's your activity level?</Text>
            {renderDropdown(
              activityLevels.map((a) => a.label),
              activityLevels.find((a) => a.value === activityLevel)?.label || "",
              (label) => {
                const selected = activityLevels.find((a) => a.label === label);
                if (selected) setActivityLevel(selected.value);
              },
              "Select Activity Level"
            )}
          </>
        );
      case 9:
        return (
          <>
            <Text style={styles.label}>What's your diet goal?</Text>
            {renderDropdown(
              dietGoals.map((g) => g.label),
              dietGoals.find((g) => g.value === dietGoal)?.label || "",
              (label) => {
                const selected = dietGoals.find((g) => g.label === label);
                if (selected) setDietGoal(selected.value);
              },
              "Select Diet Goal"
            )}
          </>
        );
      default:
        return <Text style={styles.label}>🎉 All done! Submission coming soon...</Text>;
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.logo}>
              <Text style={styles.largeLetter}>N</Text>utri
              <Text style={styles.largeLetter}>M</Text>ate
            </Text>
            <Text style={styles.subtitle}>For a healthier life</Text>
          </View>
  
          <Animatable.View animation="fadeInUp" duration={600} style={styles.card}>
          <Text style={styles.stepText}>Step {getDisplayedStep() + 1}</Text>
            {renderStep()}
            <View style={[styles.buttonRow, step === 0 && { justifyContent: "center" }]}>
              {step > 0 && (
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                  <Text style={styles.btnText}>Back</Text>
                </TouchableOpacity>
              )}
            <TouchableOpacity
  style={styles.nextBtn}
  onPress={async () => {
    if (!isFinalStep) {
      handleNext();
    } else {
      if (!dietGoal.trim()) {
        alert("Please select your diet goal.");
        return;
      }
      // BMI Calculation
const heightMeters =
(parseInt(heightFeet || "0") * 0.3048) +
(parseInt(heightInches || "0") * 0.0254);
const weightKg = parseFloat(weight || "0");

if (!heightMeters || !weightKg || heightMeters === 0) {
alert("❌ Cannot calculate BMI. Please check your height and weight.");
return;
}

const calculatedBmi = weightKg / (heightMeters * heightMeters);
setBmi(calculatedBmi);

// Diet goal logic
if (calculatedBmi < 18.5 && dietGoal === "weight_loss") {
alert("❌ You are underweight (BMI < 18.5). Weight loss is not advised.");
return;
}
if (calculatedBmi < 18.5 && dietGoal === "muscle_building") {
alert("⚠️ Underweight. Consider gaining weight before building muscle.");
return;
}
if (calculatedBmi >= 30 && dietGoal === "muscle_building") {
alert("⚠️ Obese. Try weight loss before focusing on muscle building.");
return;
}
if (calculatedBmi >= 30 && dietGoal === "weight_gain") {
alert("⚠️ Already overweight. Weight gain is not recommended.");
return;
}
if (calculatedBmi < 16 && dietGoal === "active_lifestyle") {
alert("⚠️ Severely underweight. Consult a doctor before an active lifestyle.");
return;
}

  
      try {
        const token = await AsyncStorage.getItem("token");
  
        if (!token) {
          alert("You're not logged in.");
          navigation.replace("Login");
          return;
        }
  
        // Prepare payload
        const userDetails = {
          age: parseInt(age),
          gender,
          height_feet: parseInt(heightFeet),
          height_inches: parseInt(heightInches),
          weight: parseFloat(weight),
          bmi: calculatedBmi, 
        };

        const dietaryPreferences = {
          diet_type: dietType,
          budget,
          allergens,
          other_allergen: otherAllergen,
          lactose_free_ok: lactoseFreeOk === "Yes",
          activity_level: activityLevel,
          reason_for_diet: dietGoal,
          dislikes: [],
          weekly_variety: 7,      
        };
        
        
  
  
    
        const response = await axiosInstance.post("/api/v1/generate-diet-plan", {
          user_details: userDetails,
          dietary_preferences: dietaryPreferences,
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (response.data.message === "Diet plan generated successfully.") {
          navigation.reset({
            index: 0,
            routes: [{ name: "Home" }],
          });
        }
        else {
          alert("Failed to generate diet plan.");
        }
      } catch (error) {
        console.error("Error generating diet plan:", error);
        alert("Something went wrong while generating your diet plan.");
      }
    }
  }}
  
>
  <Text style={styles.btnText}>{isFinalStep ? "Finish" : "Next"}</Text>
</TouchableOpacity>




            </View>
          </Animatable.View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
  
};

export default DietPreferenceForm;
