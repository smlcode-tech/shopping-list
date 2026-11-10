// Liste boşken gösterilen kese görseli ve yönlendirici metin (sitedeki li.empty).
import { Image, StyleSheet, Text, View } from 'react-native';

import { fonts, usePalette } from '../theme';

export function EmptyState({ text }: { text: string }) {
  const p = usePalette();
  return (
    <View style={styles.wrap}>
      <Image source={require('../../assets/hero.png')} style={styles.img} />
      <Text style={[styles.text, { color: p.muted }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6, padding: 24 },
  img: { width: 56, height: 56 },
  text: { fontFamily: fonts.body, fontSize: 15, textAlign: 'center' },
});
