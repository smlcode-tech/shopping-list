// Para, tarih ve fiyat girişi biçimlendirme yardımcıları.
// Sitedeki fmt, fmtInput, fmtDate ve parsePrice fonksiyonlarının birebir karşılıklarıdır; iki
// istemcinin aynı veriyi aynı şekilde göstermesi ve aynı girdiyi aynı şekilde kabul etmesi için.

const moneyFormat = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

// Düzenleme kutusuna yazılan değer: binlik ayırıcı olmadan, ki kullanıcı silip yeniden
// yazarken "1.234,50" içindeki noktayı yanlışlıkla ondalık sanmasın.
const inputFormat = new Intl.NumberFormat('tr-TR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  useGrouping: false,
});

const dateFormat = new Intl.DateTimeFormat('tr-TR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/** Ekranda gösterilen tutar, ör. "1.234,50 ₺". */
export const formatMoney = (n: number): string => moneyFormat.format(Number(n)) + ' ₺';

/** Düzenleme kutusuna önceden doldurulan fiyat, ör. "1234,50". */
export const formatPriceInput = (n: number): string => inputFormat.format(Number(n));

/**
 * Veritabanındaki "YYYY-MM-DD" tarihini okunur hale getirir.
 * Saat olarak gece yarısı eklenir; yalnız tarih verilirse JS onu UTC sayar ve UTC'nin
 * gerisindeki saat dilimlerinde bir önceki gün görünür.
 */
export const formatDate = (iso: string): string => dateFormat.format(new Date(iso + 'T00:00:00'));

/**
 * Kullanıcının yazdığı fiyatı sayıya çevirir; geçersizse NaN döner.
 * Hem "12,50" hem "12.50" kabul edilir. Virgül varsa nokta binlik ayırıcı sayılır ("1.234,50").
 */
export const parsePrice = (raw: string): number => {
  let s = raw.split(' ').join('');
  if (s.includes(',')) s = s.split('.').join('').replace(',', '.');
  const v = parseFloat(s);
  return Number.isFinite(v) && v >= 0 ? v : NaN;
};

/** Date nesnesini yerel saate göre "YYYY-MM-DD"ye çevirir (toISOString UTC'ye kaydırırdı). */
export const toISODate = (d: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

/**
 * "YYYY-MM-DD"yi yerel öğlen saatine sahip bir Date'e çevirir. Öğlen seçildi çünkü yaz saati
 * geçişlerinde bile gün değişmez; tarih seçici bileşene güvenle verilebilir.
 */
export const fromISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12);
};
