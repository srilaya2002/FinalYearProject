import { createNativeStackNavigator } from  "@react-navigation/native-stack";
import Login from "../app/screens/login";
import Signup from "../app/screens/signup";
import ResetPassword from "../app/screens/ResetPassword";
import NewPassword from "../app/screens/NewPassword";
import OtpVerification from "../app/screens/OtpVerification";
import Chat from "../app/screens/chat";
import DietPreferenceForm from "../app/utils/dietPreferenceForm"; 
import DietPlanDisplay from "../app/screens/dietPlanDisplay"; 
import MealLogForm from "../app/components/MealLogForm";
import Dashboard from "../app/screens/dashboard";
import HomeScreen from "../app/screens/HomeScreen";
import Reveal from "../app/screens/reveal";
import WebViewScreen from '../app/utils/WebViewScreen'; 
import  MealHistoryScreen from "../app/screens/MealHistoryScreen";


export type RootStackParamList = {
  Reveal: undefined;
  Home: undefined;
  Login: undefined;
  ResetPassword: undefined;
  Signup: undefined;
  Chat: undefined;
  WebViewScreen: { url: string };
  DietPlanDisplay: { dietPlanContent: string };
  DietPreferenceForm: undefined;
  OtpVerification: { email: string; password?: string; context: "signup" | "reset-password" };
  MealHistoryScreen: undefined;
  NewPassword: {
    email: string;
  };
  MealLogForm: { userId: number };
  Dashboard: undefined; 
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Reveal"
      screenOptions={{
        headerShown: false,
        title: "index", 
      }}
    >
      <Stack.Screen 
  name="Reveal" 
  component={Reveal} 
/>
<Stack.Screen name="WebViewScreen" component={WebViewScreen} />
      
      <Stack.Screen 
        name="Login" 
        component={Login} 
      />
      <Stack.Screen 
        name="ResetPassword" 
        component={ResetPassword} 
      />
      <Stack.Screen 
        name="NewPassword" 
        component={NewPassword} 
      />
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
      />
      <Stack.Screen 
        name="Signup" 
        component={Signup} 
      />
      <Stack.Screen 
        name="OtpVerification" 
        component={OtpVerification} 
      />
      <Stack.Screen 
        name="Chat" 
        component={Chat} 
      />
      <Stack.Screen 
        name="DietPlanDisplay" 
        component={DietPlanDisplay} 
  
      />
      <Stack.Screen 
        name="DietPreferenceForm" 
        component={DietPreferenceForm} 
     
      />
      <Stack.Screen 
        name="Dashboard" 
        component={Dashboard} 
  
      />
      <Stack.Screen 
        name="MealLogForm" 
        component={MealLogForm} 
        options={{ headerShown: false, title: "Log Today's Meals" }} 
      />
      <Stack.Screen 
        name="MealHistoryScreen" 
        component={MealHistoryScreen} 
      />
    </Stack.Navigator>
  );
};

export default AppNavigator;
