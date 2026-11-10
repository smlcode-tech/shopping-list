// Sitedeki .btn / .btn-primary düğmesi: kalın kenarlık ve basınca "içeri gömülen" sert gölge.
// Hover olmadığı için yalnızca basılı hal taklit edilir.
import { Feather } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { fonts, usePalette } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  icon?: ComponentProps<typeof Feather>['name'];
  primary?: boolean;
  disabled?: boolean;
};

export function PixelButton({ label, onPress, icon, primary, disabled }: Props) {
  const p = usePalette();
  const fg = primary ? p.pinkFg : p.fg;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: primary ? p.pink : p.card,
          borderColor: p.line,
          shadowColor: p.line,
          opacity: disabled ? 0.5 : 1,
        },
        // Basılıyken gölge kadar kayar ve gölge kaybolur; sitedeki :active ile aynı his.
        pressed && styles.pressed,
      ]}
    >
      {icon && <Feather name={icon} size={16} color={fg} />}
      <Text style={[styles.label, { color: fg }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 44,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOpacity: 0,
  },
  label: { fontFamily: fonts.heavy, fontSize: 15 },
});
