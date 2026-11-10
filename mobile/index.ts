// Uygulamanın giriş noktası: package.json'daki "main" alanı burayı gösterir.
// Expo Go'da da yerel derlemede de kök bileşeni ("main") aynı şekilde kaydeder.
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);
