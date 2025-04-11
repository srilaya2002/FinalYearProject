
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" },
  topHalf: {
    position: "absolute", top: 0, left: 0, right: 0,
    height: height * 0.4, backgroundColor: "#D8BFD8",
    borderBottomLeftRadius: width * 0.15, borderBottomRightRadius: width * 0.15,
    alignItems: "center", justifyContent: "center"
  },
  logo: { fontSize: width * 0.07, fontWeight: "bold", color: "#fff" },
  largeLetter: { fontSize: width * 0.1, fontWeight: "bold", color: "#fff" },
  subtitle: { fontSize: width * 0.05, color: "#fff", marginTop: 5 },
  card: {
    backgroundColor: "#fff", width: "90%", padding: height * 0.03,
    borderRadius: 10, alignItems: "center", shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2,
    shadowRadius: 4, elevation: 5, marginTop: height * 0.2,
  },
  title: { fontSize: width * 0.06, fontWeight: "bold", marginBottom: height * 0.02, color: "#000" },
  input: {
    width: "100%", padding: height * 0.015, borderBottomWidth: 1,
    borderBottomColor: "#6541A5", marginBottom: height * 0.02, fontSize: width * 0.045,
  },
  button: {
    backgroundColor: "#D8BFD8", paddingVertical: height * 0.02,
    borderRadius: 8, width: "100%", alignItems: "center", marginTop: height * 0.02,
  },
  buttonText: { color: "#000", fontSize: width * 0.045, fontWeight: "bold" },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#6541A5",
    marginBottom: height * 0.02,
    paddingHorizontal: 5,
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: height * 0.015,
    fontSize: width * 0.045,
  },
  bottomBackButton: {
    position: "absolute",
    bottom: height * 0.03,
    left: 20,
  },
  
  bottomBackText: {
    fontSize: width * 0.04,
    color: "#6541A5",
    fontWeight: "600",
  },
  
  
  
});
export default styles;