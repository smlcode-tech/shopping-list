// Liste satırı (sitedeki li): solda sırayla renk değiştiren kare, altta kesikli ayırıcı.
// onPress verilirse satırın ana kısmı bir alt seviyeye geçiş yapar ve ok gösterir.
//
// Düzenle/sil düğmeleri (actions) bilerek ana dokunma alanının DIŞINDA, onun kardeşi olarak durur:
// iç içe dokunulabilir öğelerde hangisinin dokunuşu alacağı platforma göre değişir (web'de iç düğmeye
// basmak dıştakini de tetikliyordu), kardeş yapıda ise belirsizlik yoktur.
import { Feather } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { markerColors, usePalette } from '../theme';

type Props = {
  index: number;
  children: ReactNode;
  actions?: ReactNode;
  onPress?: () => void;
  accessibilityLabel?: string;
};

export function Row({ index, children, actions, onPress, accessibilityLabel }: Props) {
  const p = usePalette();
  const marker = (
    <View
      style={[
        styles.marker,
        { borderColor: p.line, backgroundColor: markerColors(p)[index % 5] },
      ]}
    />
  );
  return (
    <View style={[styles.row, { borderBottomColor: p.soft }]}>
      {onPress ? (
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          style={({ pressed }) => [styles.main, pressed && { opacity: 0.6 }]}
        >
          {marker}
          {children}
          <Feather name="chevron-right" size={18} color={p.muted} />
        </Pressable>
      ) : (
        // Dokunulamayan satırda (ürün ya da düzenleme modu) düz View: içindeki metin kutuları
        // devre dışı bir düğmenin içinde kalıp odak alamaz hale gelmesin.
        <View accessibilityLabel={accessibilityLabel} style={styles.main}>
          {marker}
          {children}
        </View>
      )}
      {actions}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingLeft: 16,
    paddingRight: 6,
    borderBottomWidth: 2,
    borderStyle: 'dashed',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    paddingRight: 4,
  },
  marker: { width: 14, height: 14, borderWidth: 2, borderRadius: 4 },
});
