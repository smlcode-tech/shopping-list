// DateField.tsx'in web karşılığı. Yalnızca `expo start --web` ile tarayıcıda yapılan geliştirme
// denemeleri içindir: yerel tarih seçicinin web uygulaması olmadığından tarayıcının kendi
// <input type="date"> öğesi kullanılır (sitedekiyle aynı).
import { fonts, usePalette } from '../theme';

type Props = {
  value: string;
  onChange: (iso: string) => void;
  accessibilityLabel?: string;
};

export function DateField({ value, onChange, accessibilityLabel }: Props) {
  const p = usePalette();
  return (
    <input
      type="date"
      value={value}
      aria-label={accessibilityLabel}
      // Boş değer kabul edilmez: iOS seçicisi de her zaman bir tarih tutar.
      onChange={(e) => e.target.value && onChange(e.target.value)}
      style={{
        height: 40,
        padding: '0 10px',
        border: `2px solid ${p.line}`,
        borderRadius: 10,
        background: p.input,
        color: p.fg,
        fontFamily: fonts.bold,
        fontSize: 16,
      }}
    />
  );
}
