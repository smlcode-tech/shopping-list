# shopping-list

Ürün adı ve fiyatından oluşan basit bir alışveriş listesi. Toplam tutar sağ üstte sabit durur. Giriş Google ile yapılır, her kullanıcı yalnızca kendi listesini görür.

## Özellikler

- Ürün ekleme, düzenleme ve silme (ad ve fiyat)
- Sayfa başına 5, 10, 20 veya 50 ürün; seçim tarayıcıda hatırlanır
- Toplam tutar tüm ürünlerin toplamıdır ve üst çubukta sağda görünür
- Google ile giriş, kullanıcıya özel liste (Row Level Security)
- Renkli, pixel art esintili arayüz; açık ve koyu tema (işletim sistemi ayarını izler)

## Yapı

```
index.html            Tüm arayüz ve mantık (derleme adımı yok)
assets/               Pixel art favicon (kese + kalp): SVG, ICO, PNG, Apple touch icon
supabase/schema.sql   Tablo, güvenlik politikaları ve yetkiler
```

## Kurulum

1. Supabase'de yeni proje aç, `supabase/schema.sql` dosyasını SQL Editor'de çalıştır.
2. Google Cloud'da OAuth istemcisi (Web application) oluştur. Yönlendirme adresi: `https://<proje-ref>.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Providers → Google: Client ID ve Secret'ı gir, sağlayıcıyı aç.
4. Supabase → Authentication → URL Configuration: sitenin adresini Site URL ve Redirect URLs listesine ekle.
5. `index.html` içindeki `createClient(...)` satırına kendi proje adresini ve publishable anahtarını yaz.
6. Vercel'de bu depoyu içe aktar. Framework: Other, derleme komutu ve çıktı klasörü boş.

## Güvenlik notu

`index.html` içindeki anahtar herkese açık (publishable) anahtardır, gizli değildir. Verileri koruyan şey `supabase/schema.sql` içindeki Row Level Security politikalarıdır.
