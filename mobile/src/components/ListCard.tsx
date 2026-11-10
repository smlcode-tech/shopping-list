// Liste kartı: başlık, sayım rozeti ve altında kaydırılabilir içerik (sitedeki .card > .head + ul).
// Ekranlar FlatList'i children olarak verir; kart kalan yüksekliği doldurur, böylece uzun listeler
// sayfalama olmadan kart içinde kayar.
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fonts, usePalette } from '../theme';
import { Card } from './Card';

type Props = { title: string; count: string; children: ReactNode };

export function ListCard({ title, count, children }: Props) {
  const p = usePalette();
  return (
    <Card style={styles.card}>
      <View style={[styles.head, { borderBottomColor: p.line }]}>
        <Text style={[styles.title, { color: p.fg }]}>{title}</Text>
        <Text
          style={[styles.pill, { borderColor: p.line, backgroundColor: p.mutedBg, color: p.fg }]}
        >
          {count}
        </Text>
      </View>
      {/* overflow yalnızca içerikte kesilir; kartın kendisinde kesilseydi iOS gölgesi kaybolurdu. */}
      <View style={styles.body}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { flex: 1, minHeight: 160 },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 2,
  },
  title: { fontFamily: fonts.pixel, fontSize: 22 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderWidth: 2,
    borderRadius: 999,
    overflow: 'hidden',
    fontFamily: fonts.heavy,
    fontSize: 13,
  },
  body: {
    flex: 1,
    overflow: 'hidden',
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
});
