// styles/commonStyles.ts
import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

const styles= StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  topHalf: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: height * 0.4,
    backgroundColor: "#D8BFD8",
    borderBottomLeftRadius: width * 0.15,
    borderBottomRightRadius: width * 0.15,
    alignItems: "center",
    justifyContent: "center",
  },
  logo: {
    fontSize: width * 0.07,
    fontWeight: "bold",
    color: "#fff",
  },
  largeLetter: {
    fontSize: width * 0.1,
    fontWeight: "bold",
    color: "#fff",
  },
  subtitle: {
    fontSize: width * 0.05,
    color: "#fff",
    marginTop: 5,
  },
  card: {
    backgroundColor: "#fff",
    width: "90%",
    padding: height * 0.03,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    marginTop: height * 0.2,
  },
  title: {
    fontSize: width * 0.06,
    fontWeight: "bold",
    marginBottom: height * 0.02,
    color: "#000",
  },
  input: {
    width: "100%",
    padding: height * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: "#6541A5",
    marginBottom: height * 0.02,
    fontSize: width * 0.045,
  },
  button: {
    backgroundColor: "#D8BFD8",
    paddingVertical: height * 0.02,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginTop: height * 0.02,
  },
  buttonText: {
    color: "#000",
    fontSize: width * 0.045,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: height * 0.03,
    color: "#6541A5",
    fontSize: width * 0.04,
    fontWeight: "bold",
  },
  passwordContainer: {
    width: "100%",
    position: "relative",
    marginBottom: height * 0.02,
  },
  eyeIcon: {
    position: "absolute",
    right: 10,
    top: "50%",
    transform: [{ translateY: -12 }],
  },
  inputWithIcon: {
    flex: 1,
    paddingVertical: height * 0.015,
    fontSize: width * 0.045,
  },
  message: {
    color: "#6541A5",
    fontSize: width * 0.04,
    fontWeight: "bold",
    marginTop: height * 0.02,
    textAlign: "center",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 1,
  },
  
  backButtonText: {
    color: "#6541A5",
    fontSize: 16,
    fontWeight: "600",
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  checkbox: {
    marginRight: 10,
  },
  termsText: {
    fontSize: 14,
  },
 
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '80%',
    alignItems: 'flex-start', 
  },
  modalTitle: {
    fontSize: 22, 
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#6541A5', 
  },
  modalText: {
    fontSize: 16, 
    lineHeight: 24, 
    color: '#333', 
    marginBottom: 20, 
  },
  linkText: {
    color: '#6541A5', 
    textDecorationLine: 'underline', 
  },
  closeButton: {
    backgroundColor: '#6541A5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#ffffff', 
    fontSize: 16,
  },
  
});

export default styles;