// Giriş ekranı: oturum yokken gösterilir. Sitedeki #login bölümünün karşılığı.
// Google düğmesi Google'ın marka kurallarına uygun beyaz zemin ve renkli "G" ile çizilir.
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { signInWithGoogle } from '../auth/googleSignIn';
import { Card } from '../components/Card';
import { fonts, usePalette } from '../theme';

export function LoginScreen() {
  const p = usePalette();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const onPress = async () => {
    setMessage('');
    setBusy(true);
    try {
      await signInWithGoogle();
      // Başarıda AuthProvider ekranı kendiliğinden değiştirir; burada yapılacak bir şey yok.
    } catch (e) {
      setMessage('Giriş yapılamadı: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: p.page }]}>
      <Card stripe style={styles.card}>
        <View style={styles.body}>
          <Image source={require('../../assets/hero.png')} style={styles.hero} />
          <View style={styles.texts}>
            <Text style={[styles.title, { color: p.fg }]}>Hoş geldin!</Text>
            <Text style={[styles.sub, { color: p.muted }]}>
              Alışveriş listene ulaşmak için Google hesabınla devam et.
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ disabled: busy }}
            disabled={busy}
            onPress={onPress}
            style={({ pressed }) => [styles.gbtn, (pressed || busy) && styles.gbtnDim]}
          >
            <Image source={require('../../assets/google-g.png')} style={styles.gicon} />
            <Text style={styles.gtext}>Google ile devam et</Text>
          </Pressable>
          {!!message && (
            <Text accessibilityRole="alert" style={[styles.msg, { color: p.err }]}>
              {message}
            </Text>
          )}
          <Text style={[styles.note, { color: p.muted }]}>Listen yalnızca sana görünür.</Text>
        </View>
      </Card>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 400, alignSelf: 'center' },
  body: { padding: 28, gap: 20, alignItems: 'stretch' },
  hero: { width: 96, height: 96, alignSelf: 'center' },
  texts: { gap: 8 },
  title: { fontFamily: fonts.pixel, fontSize: 32, textAlign: 'center' },
  sub: { fontFamily: fonts.body, fontSize: 15, textAlign: 'center' },
  // Renkler sabit: Google düğmesi koyu temada da beyaz kalır (marka kuralı).
  gbtn: {
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#747775',
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  gbtnDim: { opacity: 0.6 },
  gicon: { width: 20, height: 20 },
  gtext: { color: '#1F1F1F', fontSize: 16, fontWeight: '500' },
  msg: { fontFamily: fonts.heavy, fontSize: 14, textAlign: 'center' },
  note: { fontFamily: fonts.body, fontSize: 13, textAlign: 'center' },
});
