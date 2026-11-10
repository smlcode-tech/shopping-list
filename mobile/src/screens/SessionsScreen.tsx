// "Alışverişlerim" ekranı: tarih bazlı alışverişlerin listesi (en üst seviye).
// Sitedeki view-sessions bölümünün karşılığı. Başlıktaki toplam tüm alışverişlerin toplamıdır.
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useLayoutEffect, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { Card } from '../components/Card';
import { DateField } from '../components/DateField';
import { EmptyState } from '../components/EmptyState';
import { ListCard } from '../components/ListCard';
import { PixelButton } from '../components/PixelButton';
import { Row } from '../components/Row';
import { EditActions, ViewActions } from '../components/RowActions';
import { Screen } from '../components/Screen';
import { TotalBadge } from '../components/TotalBadge';
import {
  createSession,
  deleteSession,
  fetchSessions,
  updateSessionDate,
  type SessionSummary,
} from '../lib/api';
import { confirmDestructive } from '../lib/confirm';
import { formatDate, formatMoney, toISODate } from '../lib/format';
import { supabase } from '../lib/supabase';
import type { AppStackParamList } from '../navigation/types';
import { fonts, usePalette } from '../theme';

type Props = NativeStackScreenProps<AppStackParamList, 'Sessions'>;

export function SessionsScreen({ navigation }: Props) {
  const p = usePalette();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  // Sitede tarih kutusu boş başlar; iOS seçicisi boş değer tutamadığı için bugünle başlatılır.
  const [newDate, setNewDate] = useState(() => toISODate(new Date()));
  const [editing, setEditing] = useState<{ id: number; date: string } | null>(null);
  // Aynı anda tek bir yazma işlemi: çift dokunmada iki kez kayıt eklenmesini önler.
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const total = sessions.reduce((sum, s) => sum + s.total, 0);

  const load = useCallback(async () => {
    try {
      setSessions(await fetchSessions());
      setMessage('');
    } catch {
      setMessage('Alışverişler yüklenemedi, aşağı çekip yenile.');
    }
  }, []);

  // Alt ekrandan geri dönüldüğünde toplamlar değişmiş olabilir; sitede de geri dönüşte yeniden yüklenir.
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Pressable
          accessibilityRole="button"
          onPress={() => supabase.auth.signOut()}
          hitSlop={8}
        >
          <Text style={[styles.logout, { color: p.fg }]}>Çıkış</Text>
        </Pressable>
      ),
      headerRight: () => <TotalBadge amount={total} />,
    });
  }, [navigation, total, p]);

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

  const add = () => mutate(() => createSession(newDate), 'Eklenemedi, tekrar dene.');

  const saveEdit = async () => {
    if (!editing) return;
    const ok = await mutate(
      () => updateSessionDate(editing.id, editing.date),
      'Güncellenemedi, tekrar dene.',
    );
    if (ok) setEditing(null);
  };

  const remove = async (s: SessionSummary) => {
    const yes = await confirmDestructive(
      formatDate(s.date) + ' silinsin mi?',
      'Bu alışverişi silersen içindeki tüm listeler ve ürünler de silinir.',
    );
    if (!yes) return;
    const ok = await mutate(() => deleteSession(s.id), 'Silinemedi, tekrar dene.');
    if (ok && editing?.id === s.id) setEditing(null);
  };

  const renderItem = ({ item: s, index }: { item: SessionSummary; index: number }) => {
    if (editing?.id === s.id) {
      return (
        <Row
          index={index}
          actions={
            <EditActions onSave={saveEdit} onCancel={() => setEditing(null)} busy={busy} />
          }
        >
          <View style={styles.grow}>
            <DateField
              value={editing.date}
              onChange={(date) => setEditing({ id: s.id, date })}
              accessibilityLabel="Tarih"
            />
          </View>
        </Row>
      );
    }
    return (
      <Row
        index={index}
        accessibilityLabel={formatDate(s.date) + ', ' + formatMoney(s.total)}
        onPress={() => navigation.navigate('Lists', { sessionId: s.id, date: s.date })}
        actions={
          <ViewActions
            label={formatDate(s.date)}
            onEdit={() => {
              setMessage('');
              setEditing({ id: s.id, date: s.date });
            }}
            onDelete={() => remove(s)}
            busy={busy}
          />
        }
      >
        <Text style={[styles.name, { color: p.fg }]}>{formatDate(s.date)}</Text>
        <Text style={[styles.price, { color: p.fg }]}>{formatMoney(s.total)}</Text>
      </Row>
    );
  };

  return (
    <Screen message={message}>
      <Card stripe>
        <View style={styles.addRow}>
          <View style={styles.grow}>
            <Text style={[styles.label, { color: p.fg }]}>Tarih</Text>
            <DateField value={newDate} onChange={setNewDate} accessibilityLabel="Tarih" />
          </View>
          <PixelButton label="Yeni Alışveriş" icon="plus" primary onPress={add} disabled={busy} />
        </View>
      </Card>
      <ListCard title="Alışverişlerim" count={sessions.length + ' alışveriş'}>
        <FlatList
          data={sessions}
          keyExtractor={(s) => String(s.id)}
          renderItem={renderItem}
          extraData={{ editing, busy }}
          ListEmptyComponent={<EmptyState text="Henüz alışveriş yok, ilk alışverişini ekle!" />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyboardShouldPersistTaps="handled"
        />
      </ListCard>
    </Screen>
  );
}

const styles = StyleSheet.create({
  addRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, padding: 16 },
  grow: { flex: 1, alignItems: 'flex-start', gap: 6 },
  label: { fontFamily: fonts.heavy, fontSize: 15 },
  name: { flex: 1, fontFamily: fonts.bold, fontSize: 16 },
  price: { fontFamily: fonts.heavy, fontSize: 16, fontVariant: ['tabular-nums'] },
  logout: { fontFamily: fonts.heavy, fontSize: 16, paddingRight: 12 },
});
