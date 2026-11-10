// Veri erişim katmanı: ekranların Supabase'e yaptığı tüm okuma/yazma çağrıları burada toplanır.
// Sorgular sitedeki (index.html) sorgularla aynıdır, böylece iki istemci aynı şema varsayımıyla çalışır.
// Sahiplik kontrolü burada yapılmaz; bunu veritabanındaki RLS politikaları (supabase/schema.sql) yapar.
// Her fonksiyon hata durumunda fırlatır; kullanıcıya gösterilecek mesajı ekranlar seçer.

import { supabase } from './supabase';

export type SessionSummary = { id: number; date: string; total: number };
export type ListSummary = { id: number; name: string; total: number };
export type Item = { id: number; name: string; price: number };

// PostgREST numeric sütunları duruma göre sayı ya da metin olarak döndürebilir; toplamaya
// girmeden önce hep Number'a çevrilir.
const sumPrices = (rows: { price: number | string }[]): number =>
  rows.reduce((sum, r) => sum + Number(r.price), 0);

const toItem = (r: { id: number; name: string; price: number | string }): Item => ({
  id: r.id,
  name: r.name,
  price: Number(r.price),
});

/* --- Alışverişlerim (shopping_sessions) --- */

/** Alışverişleri yeniden eskiye, her birinin altındaki tüm ürünlerin toplamıyla getirir. */
export async function fetchSessions(): Promise<SessionSummary[]> {
  // Toplamı tek istekte hesaplamak için iç içe seçim: session > lists > items(price).
  const { data, error } = await supabase
    .from('shopping_sessions')
    .select('id,date,lists(items(price))')
    .order('date', { ascending: false });
  if (error) throw error;
  return data.map((s) => ({
    id: s.id,
    date: s.date,
    total: s.lists.reduce((sum, l) => sum + sumPrices(l.items), 0),
  }));
}

export async function createSession(date: string): Promise<void> {
  // user_id gönderilmez: veritabanında varsayılanı auth.uid().
  const { error } = await supabase.from('shopping_sessions').insert({ date });
  if (error) throw error;
}

export async function updateSessionDate(id: number, date: string): Promise<void> {
  const { error } = await supabase.from('shopping_sessions').update({ date }).eq('id', id);
  if (error) throw error;
}

/** Alt listeler ve ürünler veritabanındaki "on delete cascade" ile birlikte silinir. */
export async function deleteSession(id: number): Promise<void> {
  const { error } = await supabase.from('shopping_sessions').delete().eq('id', id);
  if (error) throw error;
}

/* --- Listelerim (lists) --- */

/** Bir alışverişin listelerini, oluşturulma sırasıyla ve her listenin toplamıyla getirir. */
export async function fetchLists(sessionId: number): Promise<ListSummary[]> {
  const { data, error } = await supabase
    .from('lists')
    .select('id,name,items(price)')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data.map((l) => ({ id: l.id, name: l.name, total: sumPrices(l.items) }));
}

export async function createList(sessionId: number, name: string): Promise<void> {
  const { error } = await supabase.from('lists').insert({ session_id: sessionId, name });
  if (error) throw error;
}

export async function renameList(id: number, name: string): Promise<void> {
  const { error } = await supabase.from('lists').update({ name }).eq('id', id);
  if (error) throw error;
}

export async function deleteList(id: number): Promise<void> {
  const { error } = await supabase.from('lists').delete().eq('id', id);
  if (error) throw error;
}

/* --- Ürünler (items) --- */

/** Ürünleri eklenme sırasıyla getirir (sitede de id'ye göre sıralanır). */
export async function fetchItems(listId: number): Promise<Item[]> {
  const { data, error } = await supabase
    .from('items')
    .select('id,name,price')
    .eq('list_id', listId)
    .order('id', { ascending: true });
  if (error) throw error;
  return data.map(toItem);
}

/**
 * Ürünü ekler ve veritabanındaki halini döndürür. Ekran listeyi yeniden çekmek yerine bu satırı
 * yerel listeye ekler; sitedeki davranışın aynısı, gereksiz bir ağ isteğini önler.
 */
export async function createItem(listId: number, name: string, price: number): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .insert({ name, price, list_id: listId })
    .select('id,name,price')
    .single();
  if (error) throw error;
  return toItem(data);
}

export async function updateItem(id: number, name: string, price: number): Promise<Item> {
  const { data, error } = await supabase
    .from('items')
    .update({ name, price })
    .eq('id', id)
    .select('id,name,price')
    .single();
  if (error) throw error;
  return toItem(data);
}

export async function deleteItem(id: number): Promise<void> {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}
