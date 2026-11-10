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
.assetsignore         Cloudflare'e yüklenmeyecek dosyalar (README, supabase/, mobile/, .git ...)
mobile/               iOS uygulaması (Expo + React Native); aynı Supabase projesini kullanır
```

## Kurulum

1. Supabase'de yeni proje aç, `supabase/schema.sql` dosyasını SQL Editor'de çalıştır.
2. Google Cloud'da OAuth istemcisi (Web application) oluştur. Yönlendirme adresi: `https://<proje-ref>.supabase.co/auth/v1/callback`
3. Supabase → Authentication → Providers → Google: Client ID ve Secret'ı gir, sağlayıcıyı aç.
4. Supabase → Authentication → URL Configuration: sitenin adresini Site URL ve Redirect URLs listesine ekle.
5. `index.html` içindeki `createClient(...)` satırına kendi proje adresini ve publishable anahtarını yaz.
6. Cloudflare → Workers & Pages → Create → Import a repository: bu depoyu seç. Proje adı `wrangler.jsonc` içindeki `name` ile aynı olmalı (`shopping-list`). Derleme komutu boş, deploy komutu `npx wrangler deploy`.
7. Çıkan `https://shopping-list.<hesap>.workers.dev` adresini 4. adımdaki Redirect URLs listesine ekle. Eklenmezse Google girişi seni Site URL'e geri gönderir.

Yerelde denemek için: `npx wrangler dev` (http://localhost:8787).

## iOS uygulaması (mobile/)

Sitenin aynısı, telefonda yerel uygulama olarak: Alışverişlerim > Listelerim > Ürünler, Google ile giriş, açık/koyu tema. Aynı Supabase projesine bağlanır; sitede eklenen ürün uygulamada da görünür. Sitedeki sayfalama yerine ürünler tek kaydırmalı listede gösterilir.

```
mobile/App.tsx                Kök bileşen: yazı tipleri, oturuma göre giriş/uygulama, gezinme yığını
mobile/src/lib/               Supabase istemcisi, sorgular (api.ts), biçimlendirme, onay penceresi
mobile/src/auth/              Google girişi (tarayıcı + deep link + PKCE) ve oturum bağlamı
mobile/src/screens/           Giriş, Alışverişlerim, Listelerim, Ürünler ekranları
mobile/src/components/        Kart, düğme, satır, toplam rozeti, tarih seçici ...
mobile/assets/                Uygulama ikonu ve açılış görseli (sitedeki faviconlardan üretildi)
```

### Bir kerelik Supabase ayarı

Supabase → Authentication → URL Configuration → Redirect URLs listesine şunları ekle:

- `alisveris://auth-callback`: kendi derlediğin uygulama (EAS veya Xcode)
- `exp://**`: Expo Go ile deneme (adres bilgisayarının yerel IP'sini içerdiği için joker karakterle)

Eklenmezse Google girişi uygulamaya dönmez, Site URL'e gider.

### Telefonda deneme (Expo Go, ücretsiz)

1. iPhone'a App Store'dan **Expo Go**'yu kur.
2. Bilgisayarda: `cd mobile && npm install && npx expo start`
3. Terminaldeki QR kodu iPhone kamerasıyla okut. Telefon ve bilgisayar aynı Wi-Fi'da olmalı.

Expo Go, bilgisayardaki sunucu açıkken çalışır; kalıcı bir uygulama değildir.

### Telefona kalıcı kurulum

- **Apple Developer hesabı varsa (yıllık 99 $):** `npx eas-cli@latest build --platform ios`. Mac gerekmez, derleme Expo'nun bulutunda yapılır. Cihazını önce `npx eas-cli@latest device:create` ile kaydet ve derleme profilinde "internal distribution" seç.
- **Mac varsa, ücretsiz Apple ID ile:** `cd mobile && npx expo run:ios --device`. Uygulama 7 günde bir yeniden yüklenmeli (Apple'ın ücretsiz hesap sınırı).

Tip kontrolü: `cd mobile && npm run typecheck`

## Barındırma ve veri

Site Cloudflare Workers'ta statik dosya olarak sunulur (önceden Vercel'deydi). Tüm veri ve kullanıcılar Supabase'dedir; barındırma sağlayıcısını değiştirmek veriye dokunmaz.

## Güvenlik notu

`index.html` içindeki anahtar herkese açık (publishable) anahtardır, gizli değildir. Verileri koruyan şey `supabase/schema.sql` içindeki Row Level Security politikalarıdır.
