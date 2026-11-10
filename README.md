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
wrangler.jsonc        Cloudflare Workers dağıtım ayarı (yalnızca statik dosyalar)
.assetsignore         Cloudflare'e yüklenmeyecek dosyalar (README, supabase/, .git ...)
```

## Kurulum

1. Supabase'de yeni proje aç, `supabase/schema.sql` dosyasını SQL Editor'de çalıştır.
2. Google Cloud'da OAuth istemcisi (Web application) oluştur. Yönlendirme adresi: `https://<proje-ref>.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Providers → Google: Client ID ve Secret'ı gir, sağlayıcıyı aç.
4. Supabase → Authentication → URL Configuration: sitenin adresini Site URL ve Redirect URLs listesine ekle.
5. `index.html` içindeki `createClient(...)` satırına kendi proje adresini ve publishable anahtarını yaz.
6. Cloudflare → Workers & Pages → Create → Import a repository: bu depoyu seç. Proje adı `wrangler.jsonc` içindeki `name` ile aynı olmalı (`alisveris-listesi`). Derleme komutu boş, deploy komutu `npx wrangler deploy`.
7. Çıkan `https://alisveris-listesi.<hesap>.workers.dev` adresini 4. adımdaki Redirect URLs listesine ekle. Eklenmezse Google girişi seni Site URL'e geri gönderir.

Yerelde denemek için: `npx wrangler dev` (http://localhost:8787).

## Barındırma ve veri

Site Cloudflare Workers'ta statik dosya olarak sunulur (önceden Vercel'deydi). Tüm veri ve kullanıcılar Supabase'dedir; barındırma sağlayıcısını değiştirmek veriye dokunmaz.

## Güvenlik notu

`index.html` içindeki anahtar herkese açık (publishable) anahtardır, gizli değildir. Verileri koruyan şey `supabase/schema.sql` içindeki Row Level Security politikalarıdır.
