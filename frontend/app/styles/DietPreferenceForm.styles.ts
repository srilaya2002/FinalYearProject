// DietPreferenceForm.styles.ts

import { StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#D8BFD8", alignItems: "center", padding: 20, paddingTop: 60 },
  header: { alignItems: "center", marginBottom: 20 },
  logo: { fontSize: width * 0.08, fontWeight: "bold", color: "#fff" },
  largeLetter: { fontSize: width * 0.1, fontWeight: "bold", color: "#fff" },
  subtitle: { color: "#fff", fontSize: width * 0.045, marginTop: 5 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
  },
  stepText: { fontSize: 18, fontWeight: "bold", color: "#6541A5", marginBottom: 15, textAlign: "center" },
  label: { fontSize: 16, fontWeight: "600", marginBottom: 10, color: "#333" },
  input: {
    backgroundColor: "#f3f3f3",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  dropdownButton: {
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  dropdownButtonText: { textAlign: "left", fontSize: 16, color: "#333" },
  dropdownList: { backgroundColor: "#fff", borderRadius: 8 },
  dropdownItem: { paddingVertical: 10, paddingHorizontal: 15 },
  dropdownItemText: { fontSize: 16, color: "#000" },
  selectedItem: { fontWeight: "bold", color: "#007AFF" },
  buttonRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 20 },
  nextBtn: {
    backgroundColor: "#6541A5",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
  },
  backBtn: {
    backgroundColor: "#aaa",
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginRight: 10,
  },
  btnText: { color: "#fff", fontWeight: "bold" },
  selectedAllergensContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  selectedAllergen: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    margin: 4,
  },
  selectedAllergenText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  allergenGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  allergenOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f3f3f3",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ccc",
    margin: 6,
  },
  allergenOptionSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  allergenOptionText: {
    fontSize: 14,
    color: "#333",
  },
  allergenOptionTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-start",
    paddingBottom: 0,
  },
});

export default styles;
