// Google ile giriş akışı. Sitedeki signInWithOAuth çağrısının mobil karşılığıdır.
//
// Neden bu yol: Google, uygulama içine gömülü WebView'da OAuth'u engeller (disallowed_useragent).
// Bu yüzden giriş sayfası sistemin güvenli tarayıcı oturumunda (iOS'ta ASWebAuthenticationSession)
// açılır ve sonuç bir deep link ile uygulamaya döner. Supabase'in mevcut Google ayarı yeniden
// kullanılır; ayrıca iOS için bir Google OAuth istemcisi açmak gerekmez.
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '../lib/supabase';

// Yalnızca web için gerekli: giriş açılır penceresi kendini kapatıp sonucu ana pencereye iletir.
// iOS'ta hiçbir şey yapmaz.
WebBrowser.maybeCompleteAuthSession();

/**
 * Dönüş adresi. Ortama göre değişir ve hepsinin Supabase'de Redirect URLs listesinde olması gerekir:
 * - Kendi derlemen (EAS / Xcode): alisveris://auth-callback  (app.json'daki "scheme")
 * - Expo Go: exp://<bilgisayarın-ip>:8081/--/auth-callback
 */
export const redirectUrl = (): string => Linking.createURL('auth-callback');

/**
 * Girişi başlatır. Başarıda Supabase oturumu kurulur ve AuthProvider'daki dinleyici ekranı değiştirir.
 * Kullanıcı tarayıcıyı kapatırsa sessizce döner (hata değil).
 */
export async function signInWithGoogle(): Promise<void> {
  const redirectTo = redirectUrl();

  // skipBrowserRedirect: supabase-js'in sayfayı kendisi yönlendirmesi yerine yalnızca adresi
  // döndürmesi için; telefonda "sayfa yönlendirme" diye bir şey yok.
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw error;

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
  if (result.type !== 'success') return;

  const { queryParams } = Linking.parse(result.url);
  // Supabase bir hata nedeniyle (ör. Redirect URL izinli değil) geri dönerse bunu kullanıcıya göster.
  const errorDescription = queryParams?.error_description ?? queryParams?.error;
  if (errorDescription) throw new Error(String(errorDescription));

  const code = queryParams?.code;
  if (typeof code !== 'string') throw new Error('Giriş kodu alınamadı.');

  // PKCE (supabase.ts'de flowType): kodu, bu cihazda saklı doğrulayıcıyla oturuma çevir.
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) throw exchangeError;
}
