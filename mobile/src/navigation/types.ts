// Uygulama içi gezinme ağacının parametre tipleri.
// Üç seviye, sitedeki görünümlerle aynı: Alışverişlerim > Listelerim > Ürünler.
// Başlıkta hemen gösterilebilsin diye üst seviyedeki ad/tarih de taşınır; ekran açılırken ek sorgu gerekmez.
export type AppStackParamList = {
  Sessions: undefined;
  Lists: { sessionId: number; date: string };
  Items: { listId: number; name: string };
};
