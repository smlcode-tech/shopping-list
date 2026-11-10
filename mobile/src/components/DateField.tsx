// Tarih seçici (iOS). Sitedeki <input type="date"> karşılığı; iOS'un "compact" seçicisi kullanılır:
// dokununca takvim açılan küçük bir düğme, satır içine sığar.
// Web derlemesi DateField.web.tsx'i kullanır çünkü bu yerel bileşenin web uygulaması yoktur.
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'react-native';

import { fromISODate, toISODate } from '../lib/format';
import { usePalette } from '../theme';

type Props = {
  /** "YYYY-MM-DD"; veritabanıyla aynı biçim, ekranlar Date nesnesiyle uğraşmasın diye. */
  value: string;
  onChange: (iso: string) => void;
  accessibilityLabel?: string;
};

export function DateField({ value, onChange, accessibilityLabel }: Props) {
  const p = usePalette();
  const scheme = useColorScheme();
  return (
    <DateTimePicker
      value={fromISODate(value)}
      mode="date"
      display="compact"
      locale="tr-TR"
      accentColor={p.pink}
      themeVariant={scheme === 'dark' ? 'dark' : 'light'}
      accessibilityLabel={accessibilityLabel}
      onChange={(_event, date) => {
        if (date) onChange(toISODate(date));
      }}
    />
  );
}
