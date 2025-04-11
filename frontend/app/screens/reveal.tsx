import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { NativeStackScreenProps } from  "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/appNavigator"; 

type Props = NativeStackScreenProps<RootStackParamList, "Reveal">;

const Reveal: React.FC<Props> = ({ navigation }) => {
  useEffect(() => {
    setTimeout(() => {
      navigation.replace("Login"); 
    }, 1000);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require("../../assets/images/logo.png")} style={styles.logo} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 200,
    height: 200,
    marginBottom: 15,
  },
});

export default Reveal;
