// "Listelerim" ekranı: seçilen alışverişin altındaki adlandırılmış listeler (orta seviye).
// Sitedeki view-lists bölümünün karşılığı. Başlıktaki toplam bu alışverişteki tüm listelerin toplamıdır.
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { EmptyState } from '../components/EmptyState';
import { ListCard } from '../components/ListCard';
import { PixelButton } from '../components/PixelButton';
import { Row } from '../components/Row';
import { EditActions, ViewActions } from '../components/RowActions';
import { Screen } from '../components/Screen';
import { TextField } from '../components/TextField';
import { TotalBadge } from '../components/TotalBadge';
import { createList, deleteList, fetchLists, renameList, type ListSummary } from '../lib/api';
import { confirmDestructive } from '../lib/confirm';
import { formatDate, formatMoney } from '../lib/format';
import type { AppStackParamList } from '../navigation/types';
import { fonts, usePalette } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Lists'>;

export function ListsScreen({ navigation, route }: Props) {
  const { sessionId, date } = route.params;
  const p = usePalette();
  const [lists, setLists] = useState<ListSummary[]>([]);
  const [newName, setNewName] = useState('');
  const [editing, setEditing] = useState<{ id: number; name: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const total = lists.reduce((sum, l) => sum + l.total, 0);

  const load = useCallback(async () => {
    try {
      setLists(await fetchLists(sessionId));
      setMessage('');
    } catch {
      setMessage('Listeler yüklenemedi, aşağı çekip yenile.');
    }
  }, [sessionId]);

  // Ürünler ekranından geri dönüldüğünde liste toplamları değişmiş olabilir.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      // Sitede başlık "Listelerim"dir; telefonda kart başlığı zaten bunu söylediği için
      // üst başlıkta hangi alışverişte olunduğu gösterilir.
      title: formatDate(date),
      headerRight: () => <TotalBadge amount={total} />,
    });
  }, [navigation, date, total]);

  const onRefresh = async () => {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  };

  /** Yazma işlemlerinin ortak kalıbı: kilitle, çalıştır, hata mesajını göster, listeyi tazele. */
  const mutate = async (action: () => Promise<void>, failMessage: string): Promise<boolean> => {
    setBusy(true);
    try {
      await action();
      setMessage('');
      await load();
      return true;
    } catch {
      setMessage(failMessage);
      return false;
    } finally {
      setBusy(false);
    }
  };

  const add = async () => {
    const name = newName.trim();
    if (!name) return;
    const ok = await mutate(() => createList(sessionId, name), 'Eklenemedi, tekrar dene.');
    if (ok) setNewName('');
  };

  const saveEdit = async () => {
    if (!editing) return;
    const name = editing.name.trim();
    if (!name) return;
    const ok = await mutate(() => renameList(editing.id, name), 'Güncellenemedi, tekrar dene.');
    if (ok) setEditing(null);
  };

  const remove = async (l: ListSummary) => {
    const yes = await confirmDestructive(
      l.name + ' silinsin mi?',
      'Bu listeyi silersen içindeki tüm ürünler de silinir.',
    );
    if (!yes) return;
    const ok = await mutate(() => deleteList(l.id), 'Silinemedi, tekrar dene.');
    if (ok && editing?.id === l.id) setEditing(null);
  };

  const renderItem = ({ item: l, index }: { item: ListSummary; index: number }) => {
    if (editing?.id === l.id) {
      return (
        <Row
          index={index}
          actions={
            <EditActions onSave={saveEdit} onCancel={() => setEditing(null)} busy={busy} />
          }
        >
          <TextField
            value={editing.name}
            onChangeText={(name) => setEditing({ id: l.id, name })}
            onSubmitEditing={saveEdit}
            maxLength={100}
            autoFocus
            returnKeyType="done"
            accessibilityLabel="Liste adı"
            style={styles.grow}
          />
        </Row>
      );
    }
    return (
      <Row
        index={index}
        accessibilityLabel={l.name + ', ' + formatMoney(l.total)}
        onPress={() => navigation.navigate('Items', { listId: l.id, name: l.name })}
        actions={
          <ViewActions
            label={l.name}
            onEdit={() => {
              setMessage('');
              setEditing({ id: l.id, name: l.name });
            }}
            onDelete={() => remove(l)}
            busy={busy}
          />
        }
      >
        <Text style={[styles.name, { color: p.fg }]}>{l.name}</Text>
        <Text style={[styles.price, { color: p.fg }]}>{formatMoney(l.total)}</Text>
      </Row>
    );
  };

  return (
    <Screen message={message}>
      <Card stripe>
        <View style={styles.addRow}>
          <TextField
            label="Liste adı"
            placeholder="Örn. Market"
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={add}
            maxLength={100}
            returnKeyType="done"
            // Ekledikten sonra klavye açık kalsın; arka arkaya liste eklemek kolaylaşsın.
            submitBehavior="submit"
            style={styles.grow}
          />
          <PixelButton label="Yeni Liste" icon="plus" primary onPress={add} disabled={busy} />
        </View>
      </Card>
      <ListCard title="Listelerim" count={lists.length + ' liste'}>
        <FlatList
          data={lists}
          keyExtractor={(l) => String(l.id)}
          renderItem={renderItem}
          extraData={{ editing, busy }}
          ListEmptyComponent={<EmptyState text="Bu alışverişte henüz liste yok, ilk listeni ekle!" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyboardShouldPersistTaps="handled"
        />
      </ListCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, padding: 16 },
  grow: { flex: 1 },
  name: { flex: 1, fontFamily: fonts.bold, fontSize: 16 },
  price: { fontFamily: fonts.heavy, fontSize: 16, fontVariant: ['tabular-nums'] },
});
