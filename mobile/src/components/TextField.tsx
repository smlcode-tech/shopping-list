// Etiketli metin kutusu (sitedeki .field + input). Ekleme formlarında ve satır içi düzenlemede kullanılır.
import type { ComponentRef, Ref } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { fonts, usePalette } from '../theme';

/** Odak yönetimi (ad → fiyat) için kutuya erişen ekranların kullandığı tip. */
export type TextFieldHandle = ComponentRef<typeof TextInput>;

// React 19'da ref sıradan bir prop olarak geçer; forwardRef gerekmez.
type Props = TextInputProps & { label?: string; ref?: Ref<TextFieldHandle> };

export function TextField({ label, style, ref, ...rest }: Props) {
  const p = usePalette();
  const input = (
    <TextInput
      ref={ref}
      placeholderTextColor={p.muted}
      style={[
        styles.input,
        { backgroundColor: p.input, borderColor: p.line, color: p.fg },
        // Etiketsiz (satır içi) kullanımda dış stil doğrudan kutuya uygulanır.
        !label && style,
      ]}
      {...rest}
    />
  );
  if (!label) return input;
  return (
    <View style={[styles.field, style]}>
      <Text style={[styles.label, { color: p.fg }]}>{label}</Text>
      {input}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6 },
  label: { fontFamily: fonts.heavy, fontSize: 15 },
  input: {
    height: 44,
    paddingHorizontal: 12,
    borderWidth: 2,
    borderRadius: 10,
    fontFamily: fonts.bold,
    fontSize: 16, // 16'nın altında iOS odaklanınca sayfayı yakınlaştırır (web derlemesinde).
  },
});
