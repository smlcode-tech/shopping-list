// Üç liste ekranının ortak iskeleti: sayfa zemini, klavye açılınca içeriği yukarı itme,
// alt güvenli alan boşluğu ve hata mesajı satırı.
import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text } from 'react-native';
import { useHeaderHeight } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { fonts, usePalette } from '../theme';

type Props = { children: ReactNode; message?: string };

export function Screen({ children, message }: Props) {
  const p = usePalette();
  const insets = useSafeAreaInsets();
  // Başlık çubuğu yerel (native) olduğundan KeyboardAvoidingView onun yüksekliğini bilmez;
  // verilmezse klavye ekleme kutusunun bir kısmını örter.
  const headerHeight = useHeaderHeight();
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={headerHeight}
      style={[styles.root, { backgroundColor: p.page, paddingBottom: insets.bottom + 12 }]}
    >
      {!!message && (
        <Text accessibilityRole="alert" style={[styles.msg, { color: p.err }]}>
          {message}
        </Text>
      )}
      {children}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  msg: { fontFamily: fonts.heavy, fontSize: 15 },
});
