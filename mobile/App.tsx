// Kök bileşen: yazı tiplerini yükler, oturuma göre giriş ekranı ile uygulama ekranları arasında geçer
// ve gezinme yığınını (Alışverişlerim > Listelerim > Ürünler) kurar.
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from '@expo-google-fonts/nunito';
import { PixelifySans_600SemiBold } from '@expo-google-fonts/pixelify-sans';
import { DarkTheme, DefaultTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from './src/auth/AuthProvider';
import type { AppStackParamList } from './src/navigation/types';
import { ItemsScreen } from './src/screens/ItemsScreen';
import { ListsScreen } from './src/screens/ListsScreen';
import { LoginScreen } from './src/screens/LoginScreen';
import { SessionsScreen } from './src/screens/SessionsScreen';
import { fonts, usePalette } from './src/theme';

const Stack = createNativeStackNavigator<AppStackParamList>();

// Açılış ekranı yazı tipleri ve saklı oturum hazır olana dek ekranda kalsın; aksi halde
// kullanıcı önce boş bir sayfa, girişliyse bir an da giriş ekranını görürdü.
SplashScreen.preventAutoHideAsync();

/** Oturum varsa uygulama yığını, yoksa giriş ekranı. */
function Root() {
  const { session, loading } = useAuth();
  const p = usePalette();
  const scheme = useColorScheme();

  useEffect(() => {
    if (!loading) SplashScreen.hideAsync();
  }, [loading]);

  // Saklı oturum okunurken hiçbir şey çizilmez; bu sürede açılış ekranı görünür kalır.
  if (loading) return null;
  if (!session) return <LoginScreen />;

  // React Navigation'ın kendi zemin/başlık renkleri sitenin paletine eşlenir.
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;
  const navTheme: Theme = {
    ...base,
    colors: {
      ...base.colors,
      background: p.page,
      card: p.page,
      text: p.fg,
      border: p.line,
      primary: p.pink,
    },
  };

  return (
    // Çıkış yapılınca bu ağaç tümden kalkar; böylece yeniden girişte gezinme yığını ve ekran
    // durumları sıfırdan başlar (sitede onAuthStateChange'te elle sıfırlanan durumlar).
    <NavigationContainer theme={navTheme}>
      <Stack.Navigator
        screenOptions={{
          headerTitleStyle: { fontFamily: fonts.pixel, fontSize: 20 },
          headerShadowVisible: true,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: p.page },
        }}
      >
        <Stack.Screen name="Sessions" component={SessionsScreen} options={{ title: 'Alışverişlerim' }} />
        <Stack.Screen name="Lists" component={ListsScreen} options={{ title: 'Listelerim' }} />
        <Stack.Screen name="Items" component={ItemsScreen} options={{ title: 'Ürünler' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  // Anahtar adları theme.ts'deki `fonts` ile aynı olmalı; RN'de her ağırlık ayrı bir aile adıdır.
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    PixelifySans_600SemiBold,
  });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Root />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
