// Satırın sağındaki düğme çiftleri (sitedeki .acts): normal modda düzenle/sil, düzenleme modunda
// kaydet/vazgeç. Üç ekran da aynı çiftleri kullandığı için tek yerde tanımlı; Row'a `actions`
// olarak verilir.
import { StyleSheet, View } from 'react-native';

import { IconButton } from './IconButton';

type ViewActionsProps = {
  /** Ekran okuyucuda "Düzenle: Süt" gibi okunması için satırın adı. */
  label: string;
  onEdit: () => void;
  onDelete: () => void;
  busy: boolean;
};

export function ViewActions({ label, onEdit, onDelete, busy }: ViewActionsProps) {
  return (
    <View style={styles.acts}>
      <IconButton icon="edit-2" label={'Düzenle: ' + label} onPress={onEdit} />
      <IconButton icon="trash-2" label={'Sil: ' + label} onPress={onDelete} disabled={busy} />
    </View>
  );
}

type EditActionsProps = { onSave: () => void; onCancel: () => void; busy: boolean };

export function EditActions({ onSave, onCancel, busy }: EditActionsProps) {
  return (
    <View style={styles.acts}>
      <IconButton icon="check" label="Kaydet" onPress={onSave} disabled={busy} strong />
      <IconButton icon="x" label="Vazgeç" onPress={onCancel} />
    </View>
  );
}

const styles = StyleSheet.create({
  acts: { flexDirection: 'row' },
});
