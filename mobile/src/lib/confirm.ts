// Silme gibi geri alınamaz işlemlerden önce sorulan onay penceresi (iOS uygulaması).
// Sitedeki window.confirm çağrısının yerel karşılığıdır. Web derlemesi confirm.web.ts'yi kullanır,
// çünkü react-native-web'de Alert.alert düğme göstermez ve onay hiç gelmezdi.
import { Alert } from 'react-native';

/** Kullanıcı "Sil"e basarsa true, vazgeçerse ya da pencereyi kapatırsa false döner. */
export function confirmDestructive(title: string, message: string): Promise<boolean> {
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Vazgeç', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Sil', style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}
