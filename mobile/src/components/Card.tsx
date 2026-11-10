// Sitedeki .card stilinin karşılığı: kalın kenarlık, sert ofset gölge ve isteğe bağlı gökkuşağı şeridi.
// Ekleme formları şeritli, listeler şeritsiz kullanılır (sitedeki .add::before ile aynı ayrım).
import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { usePalette } from '../theme';

const STRIPE_SEGMENT = 24;
// Telefon genişliğinde şeridi doldurmaya yetecek kadar parça; taşan kısım kesilir.
const STRIPE_COUNT = 24;

type Props = {
  children: ReactNode;
  stripe?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, stripe, style }: Props) {
  const p = usePalette();
  const colors = [p.pink, p.lemon, p.mint, p.sky, p.lav];
  return (
    // overflow:hidden burada kullanılmaz: iOS'ta gölgeyi de keser. Bu yüzden şerit kendi köşelerini
    // yuvarlar ve kendi içinde kesilir.
    <View
      style={[
        styles.card,
        { backgroundColor: p.card, borderColor: p.line, shadowColor: p.line },
        style,
      ]}
    >
      {stripe && (
        <View style={styles.stripe}>
          {Array.from({ length: STRIPE_COUNT }, (_, i) => (
            <View
              key={i}
              style={{ width: STRIPE_SEGMENT, backgroundColor: colors[i % colors.length] }}
            />
          ))}
        </View>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    borderRadius: 16,
    // Sitedeki "box-shadow: 4px 4px 0" — bulanıklık yok, tam opak.
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  stripe: {
    height: 8,
    flexDirection: 'row',
    overflow: 'hidden',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
});
