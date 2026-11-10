// Renk, yazı tipi ve ölçü sabitleri: sitedeki CSS değişkenlerinin (:root) React Native karşılığı.
// Açık/koyu tema seçimi işletim sistemi ayarını izler; sitede bu prefers-color-scheme ile yapılır.
import { useColorScheme } from 'react-native';

export type Palette = {
  page: string;
  card: string;
  input: string;
  fg: string;
  line: string;
  soft: string;
  muted: string;
  mutedBg: string;
  pink: string;
  pinkFg: string;
  lemon: string;
  mint: string;
  sky: string;
  lav: string;
  rose: string;
  err: string;
};

// Değerler index.html'deki :root bloğundan birebir alındı.
const light: Palette = {
  page: '#FFF4E0',
  card: '#FFFBF3',
  input: '#FFFFFF',
  fg: '#3B2418',
  line: '#3B2418',
  soft: '#EBD9BA',
  muted: '#7A5A45',
  mutedBg: '#FBE8C8',
  pink: '#D6334F',
  pinkFg: '#FFFFFF',
  lemon: '#F7C948',
  mint: '#7BD3A8',
  sky: '#79C7F2',
  lav: '#B9A6F2',
  rose: '#F7A8B8',
  err: '#B3261E',
};

// Koyu temada yalnızca zemin ve metin renkleri değişir; vurgu renkleri sitede de aynı kalır.
const dark: Palette = {
  ...light,
  page: '#241613',
  card: '#33211C',
  input: '#2A1A16',
  fg: '#FFF1D6',
  line: '#0E0706',
  soft: '#4A332B',
  muted: '#C9AA93',
  mutedBg: '#3E2923',
  err: '#FF9A8F',
};

/** Satır başındaki renkli kare, sitedeki li:nth-child(5n+k) sırasını izler. */
export const markerColors = (p: Palette): string[] => [p.mint, p.sky, p.lemon, p.lav, p.rose];

/** Toplam rozetinin yazısı her iki temada da koyu kalır, çünkü zemini her zaman sarıdır. */
export const ON_LEMON = '#3B2418';

// React Native'de özel yazı tipinde fontWeight çalışmaz; her ağırlık ayrı bir aile adıdır.
// Adlar App.tsx'te useFonts'a verilen anahtarlarla aynı olmalıdır.
export const fonts = {
  body: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  heavy: 'Nunito_800ExtraBold',
  pixel: 'PixelifySans_600SemiBold',
} as const;

export function usePalette(): Palette {
  return useColorScheme() === 'dark' ? dark : light;
}
