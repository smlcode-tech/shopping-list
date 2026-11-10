// Uygulamanın tek Supabase istemcisi. Tüm veri ve giriş çağrıları (api.ts, auth/) bunu kullanır.
// Sitedeki `supabase.createClient(...)` satırının mobil karşılığıdır; farkları aşağıda açıklanmıştır.

// supabase-js URL/URLSearchParams'ın tam bir uygulamasını bekler; React Native'deki eksik kalabiliyor.
import 'react-native-url-polyfill/auto';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './config';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    // Telefonda localStorage yok; oturum AsyncStorage'da tutulur ki uygulama kapanıp açılınca
    // yeniden giriş istenmesin.
    storage: AsyncStorage,
    persistSession: true,
    autoRefreshToken: true,
    // Sitede Google dönüşü sayfa adresine gelir ve supabase-js onu kendisi okur. Uygulamada
    // dönüş deep link ile gelir ve googleSignIn.ts tarafından elle işlenir.
    detectSessionInUrl: false,
    // PKCE: Google dönüşünde adres çubuğuna token yerine tek kullanımlık bir kod gelir. Deep link
    // başka bir uygulama tarafından yakalansa bile, kodu oturuma çevirmek için gereken doğrulayıcı
    // yalnızca bu cihazın deposunda durduğundan işe yaramaz.
    flowType: 'pkce',
  },
});

// Uygulama arka plandayken token yenileme zamanlayıcısını durdur, öne gelince yeniden başlat.
// Aksi halde iOS zamanlayıcıyı askıya alır ve uzun süre sonra açılan uygulamada süresi dolmuş
// token ile istek atılır. Supabase'in React Native örneğindeki önerilen kurulum budur.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') supabase.auth.startAutoRefresh();
    else supabase.auth.stopAutoRefresh();
  });
}
