import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const DietPreferenceForm = () => {
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("");
  const [heightFeet, setHeightFeet] = useState("");
  const [heightInches, setHeightInches] = useState("");
  const [weight, setWeight] = useState("");
  const [dietType, setDietType] = useState("");
  const [weeklyVariety, setWeeklyVariety] = useState("");
  const [budget, setBudget] = useState("");
  const [dislikes, setDislikes] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/api/v1/generate-diet-plan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user_details: {
            age,
            gender,
            height_feet: parseInt(heightFeet),
            height_inches: parseInt(heightInches),
            weight: parseFloat(weight),
          },
          dietary_preferences: {
            diet_type: dietType,
            weekly_variety: parseInt(weeklyVariety),
            budget,
            dislikes,
          },
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Diet preferences submitted successfully!");
        navigate("/dietPlan", { state: { dietPlanContent: result.diet_plan } });
      } else {
        setMessage(result.detail || "Failed to submit preferences.");

      }
    } catch (error) {
      setMessage("Error submitting preferences.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Diet Preference Form</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>Age:</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Gender:</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Height (Feet and Inches):</label>
          <input
            type="number"
            value={heightFeet}
            onChange={(e) => setHeightFeet(e.target.value)}
            required
            placeholder="Feet"
            style={{ width: "48%", marginRight: "4%", padding: "8px", marginTop: "5px" }}
          />
          <input
            type="number"
            value={heightInches}
            onChange={(e) => setHeightInches(e.target.value)}
            required
            placeholder="Inches"
            style={{ width: "48%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Weight (kg):</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Diet Type:</label>
          <select
            value={dietType}
            onChange={(e) => setDietType(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="">Select Diet Type</option>
            <option value="vegetarian">Vegetarian</option>
            <option value="vegan">Vegan</option>
            <option value="non-vegetarian">Non-Vegetarian</option>
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Weekly Variety (number of unique meals):</label>
          <input
            type="number"
            value={weeklyVariety}
            onChange={(e) => setWeeklyVariety(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Budget:</label>
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          >
            <option value="">Select Budget</option>
            <option value="₹">₹ (Low)</option>
            <option value="₹₹">₹₹ (Medium)</option>
            <option value="₹₹₹">₹₹₹ (High)</option>
          </select>
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Dislikes or Allergies:</label>
          <input
            type="text"
            value={dislikes}
            onChange={(e) => setDislikes(e.target.value)}
            required
            style={{ width: "100%", padding: "8px", marginTop: "5px" }}
          />
        </div>
        {message && <div style={{ color: "blue", marginBottom: "10px" }}>{message}</div>}
        <button type="submit" style={{ padding: "10px", width: "100%" }}>
          Submit Preferences
        </button>
      </form>
    </div>
  );
};

export default DietPreferenceForm;
