import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F3E8FF", // Light purple background
    paddingBottom: 80,
  },
  backButton: {
    marginBottom: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#E5D4FF",
    borderRadius: 10,
    alignSelf: "flex-start",
  },
  backButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2D0353",
    textAlign: "center",
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A3F61",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  mealInputContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dropdownContainerStyle: {
    marginBottom: 12,
    zIndex: 1000,
  },
  dropdown: {
    borderRadius: 12,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    height: 48,
    paddingHorizontal: 10,
  },
  dropdownList: {
    borderColor: "#ccc",
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  logButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
  },
  addMealButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginVertical: 20,
  },
  submitButton: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 30,
  },
  gradientButton: {
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 5,
  },
  buttonContent: {
    paddingVertical: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
});

export default styles;
