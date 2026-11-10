// Ürünler ekranı: bir listedeki ürün adı + fiyat satırları (en alt seviye).
// Sitedeki view-items bölümünün karşılığı. Sitedeki sayfalama (5/10/20/50) yerine tüm ürünler
// tek kaydırmalı listede gösterilir; telefonda doğal olan budur ve kullanıcıyla böyle kararlaştırıldı.
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ListCard } from '../components/ListCard';
import { PixelButton } from '../components/PixelButton';
import { Row } from '../components/Row';
import { EditActions, ViewActions } from '../components/RowActions';
import { Screen } from '../components/Screen';
import { TextField, type TextFieldHandle } from '../components/TextField';
import { TotalBadge } from '../components/TotalBadge';
import { createItem, deleteItem, fetchItems, updateItem, type Item } from '../lib/api';
import { formatMoney, formatPriceInput, parsePrice } from '../lib/format';
import type { AppStackParamList } from '../navigation/types';
import { fonts, usePalette } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Items'>;

type Editing = { id: number; name: string; price: string };

export function ItemsScreen({ navigation, route }: Props) {
  const { listId, name: listName } = route.params;
  const p = usePalette();
  const [items, setItems] = useState<Item[]>([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editing, setEditing] = useState<Editing | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const listRef = useRef<FlatList<Item>>(null);
  const nameRef = useRef<TextFieldHandle>(null);
  const priceRef = useRef<TextFieldHandle>(null);
  // Yeni ürün eklenince liste sonuna kaydırılır; içerik boyutu değişmeden kaydırmak işe yaramaz,
  // bu yüzden istek bir bayrakla onContentSizeChange'e ertelenir.
  const scrollToEndPending = useRef(false);

  const total = items.reduce((sum, i) => sum + i.price, 0);

  const load = useCallback(async () => {
    try {
      setItems(await fetchItems(listId));
      setMessage('');
    } catch {
      setMessage('Liste yüklenemedi, aşağı çekip yenile.');
    }
  }, [listId]);

  // Bu ekranın altında başka ekran yok; odaklanmada değil, yalnızca açılışta yüklemek yeterli.
  useEffect(() => {
    load();
  }, [load]);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: listName,
      headerRight: () => <TotalBadge amount={total} />,
    });
  }, [navigation, listName, total]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  // Ürünlerde listeyi baştan çekmek yerine dönen satır yerel listeye işlenir (sitedeki gibi).
  const add = async () => {
    const name = newName.trim();
    const price = parsePrice(newPrice);
    if (!name) return nameRef.current?.focus();
    if (Number.isNaN(price)) return priceRef.current?.focus();
    setBusy(true);
    try {
      const created = await createItem(listId, name, price);
      setItems((prev) => [...prev, created]);
      setEditing(null);
      setNewName('');
      setNewPrice('');
      setMessage('');
      scrollToEndPending.current = true;
      // Sonraki ürün için imleci ada geri götür.
      nameRef.current?.focus();
    } catch {
      setMessage('Eklenemedi, tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    const name = editing.name.trim();
    const price = parsePrice(editing.price);
    if (!name || Number.isNaN(price)) {
      setMessage(!name ? 'Ürün adı boş olamaz.' : 'Fiyatı 12,50 gibi yaz.');
      return;
    }
    setBusy(true);
    try {
      const updated = await updateItem(editing.id, name, price);
      setItems((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      setEditing(null);
      setMessage('');
    } catch {
      setMessage('Güncellenemedi, tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  // Sitede ürün silme onay sormaz (tek satır, kolayca yeniden eklenir); burada da sormaz.
  const remove = async (id: number) => {
    setBusy(true);
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((x) => x.id !== id));
      if (editing?.id === id) setEditing(null);
      setMessage('');
    } catch {
      setMessage('Silinemedi, tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  const renderItem = ({ item: it, index }: { item: Item; index: number }) => {
    if (editing?.id === it.id) {
      return (
        <Row
          index={index}
          actions={
            <EditActions onSave={saveEdit} onCancel={() => setEditing(null)} busy={busy} />
          }
        >
          <TextField
            value={editing.name}
            onChangeText={(name) => setEditing({ ...editing, name })}
            maxLength={200}
            autoFocus
            accessibilityLabel="Ürün adı"
            style={styles.grow}
          />
          <TextField
            value={editing.price}
            onChangeText={(price) => setEditing({ ...editing, price })}
            keyboardType="decimal-pad"
            accessibilityLabel="Fiyat"
            style={styles.editPrice}
          />
        </Row>
      );
    }
    return (
      <Row
        index={index}
        accessibilityLabel={it.name + ', ' + formatMoney(it.price)}
        actions={
          <ViewActions
            label={it.name}
            onEdit={() => {
              setMessage('');
              setEditing({ id: it.id, name: it.name, price: formatPriceInput(it.price) });
            }}
            onDelete={() => remove(it.id)}
            busy={busy}
          />
        }
      >
        <Text style={[styles.name, { color: p.fg }]}>{it.name}</Text>
        <Text style={[styles.price, { color: p.fg }]}>{formatMoney(it.price)}</Text>
      </Row>
    );
  };

  return (
    <Screen message={message}>
      <Card stripe>
        <View style={styles.form}>
          <TextField
            ref={nameRef}
            label="Ürün adı"
            placeholder="Örn. Süt 1 L"
            value={newName}
            onChangeText={setNewName}
            maxLength={200}
            returnKeyType="next"
            // Ad yazılıp "ileri"ye basılınca klavye kapanmadan fiyata geç.
            submitBehavior="submit"
            onSubmitEditing={() => priceRef.current?.focus()}
          />
          <View style={styles.priceRow}>
            <TextField
              ref={priceRef}
              label="Fiyat (₺)"
              placeholder="0,00"
              value={newPrice}
              onChangeText={setNewPrice}
              // Ondalık klavyede "geri/ileri" tuşu yoktur; ekleme düğmeyle yapılır.
              keyboardType="decimal-pad"
              style={styles.grow}
            />
            <PixelButton label="Ekle" icon="plus" primary onPress={add} disabled={busy} />
          </View>
        </View>
      </Card>
      <ListCard title="Sepetim" count={items.length + ' ürün'}>
        <FlatList
          ref={listRef}
          data={items}
          keyExtractor={(it) => String(it.id)}
          renderItem={renderItem}
          extraData={{ editing, busy }}
          ListEmptyComponent={<EmptyState text="Sepetin boş, ilk ürünü ekle!" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (scrollToEndPending.current) {
              scrollToEndPending.current = false;
              listRef.current?.scrollToEnd({ animated: true });
            }
          }}
        />
      </ListCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: { padding: 16, gap: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  grow: { flex: 1 },
  editPrice: { width: 92 },
  name: { flex: 1, fontFamily: fonts.bold, fontSize: 16 },
  price: { fontFamily: fonts.heavy, fontSize: 16, fontVariant: ['tabular-nums'] },
});
