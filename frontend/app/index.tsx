import AppNavigator from '../navigation/appNavigator';
import { registerRootComponent } from "expo";

const App = () => {
  
  return <AppNavigator />;
};


registerRootComponent(App);

export default App;
