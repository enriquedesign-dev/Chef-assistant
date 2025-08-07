import { registerRootComponent } from 'expo';
import { ExpoRoot } from 'expo-router';

function App() {
  return <ExpoRoot />;
}

registerRootComponent(App);

export default App;
