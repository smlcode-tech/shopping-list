// Başlık çubuğunun sağındaki sarı "Toplam" rozeti (sitedeki .total).
// Her ekran kendi seviyesinin toplamını verir: alışverişlerin, bir alışverişteki listelerin
// ya da bir listedeki ürünlerin toplamı.
import { StyleSheet, Text, View } from 'react-native';

import { formatMoney } from '../lib/format';
import { fonts, ON_LEMON, usePalette } from '../theme';

export function TotalBadge({ amount }: { amount: number }) {
  const p = usePalette();
  return (
    <View
      accessible
      accessibilityLabel={'Toplam ' + formatMoney(amount)}
      style={[styles.badge, { backgroundColor: p.lemon, borderColor: p.line, shadowColor: p.line }]}
    >
      <Text style={styles.amount}>{formatMoney(amount)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    height: 34,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 999,
    justifyContent: 'center',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  // Rakamların genişliği sabit: tutar değişirken rozet titremez.
  amount: {
    fontFamily: fonts.heavy,
    fontSize: 16,
    color: ON_LEMON,
    fontVariant: ['tabular-nums'],
  },
});
