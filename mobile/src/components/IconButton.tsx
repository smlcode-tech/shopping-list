// Satırlardaki düzenle/sil/kaydet/vazgeç simge düğmeleri (sitedeki .ib).
// Simgeler sitedeki çizgi simgelerle aynı aileden (Feather) seçildi.
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { usePalette } from '../theme';

type Props = {
  icon: ComponentProps<typeof Feather>['name'];
  /** Ekran okuyucu için; simgenin anlamı görsel olmayan kullanıcıya bununla iletilir. */
  label: string;
  onPress: () => void;
  disabled?: boolean;
  /** Kaydet düğmesi gibi birincil eylemlerde simge soluk değil, tam renk görünür. */
  strong?: boolean;
};

export function IconButton({ icon, label, onPress, disabled, strong }: Props) {
  const p = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      // 44pt: Apple'ın önerdiği en küçük dokunma alanı.
      hitSlop={4}
      style={({ pressed }) => [
        styles.ib,
        pressed && { backgroundColor: p.mutedBg },
        disabled && styles.disabled,
      ]}
    >
      <Feather name={icon} size={18} color={strong ? p.fg : p.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  ib: {
    width: 40,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  disabled: { opacity: 0.5 },
});
