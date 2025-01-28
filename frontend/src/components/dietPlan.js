import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DietPlanDisplay = () => {
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDietPlan = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User is not logged in.");
        }

        const response = await axios.get("http://localhost:8000/api/v1/diet-plan", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data && response.data.diet_plan) {
          setDietPlan(response.data.diet_plan);
        } else {
          throw new Error("No diet plan found.");
        }
      } catch (err) {
        console.error("Error fetching diet plan:", err.message || err);
        setError(err.message || "Failed to load diet plan.");
        setTimeout(() => navigate("/diet-preference-form"), 3000); // Redirect after 3 seconds
      } finally {
        setLoading(false);
      }
    };

    fetchDietPlan();
  }, [navigate]);

  if (loading) return <div>Loading your diet plan...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ maxWidth: "600px", margin: "auto", padding: "20px" }}>
      <h2>Your Diet Plan</h2>
      <pre
        style={{
          backgroundColor: "#f8f9fa",
          padding: "15px",
          borderRadius: "5px",
          overflowX: "auto",
        }}
      >
        {dietPlan}
      </pre>
      <button
        onClick={() => navigate("/chat", { state: { dietPlanContent: dietPlan } })}
        style={{
          padding: "10px 20px",
          marginTop: "20px",
          backgroundColor: "#007bff",
          color: "#fff",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Chat with AI
      </button>
    </div>
  );
};

export default DietPlanDisplay;
