// confirm.ts'nin web karşılığı. Yalnızca `expo start --web` ile tarayıcıda yapılan geliştirme
// denemeleri içindir; telefonda çalışan kod confirm.ts'dir. Metro ".web.ts" uzantısını web
// derlemesinde otomatik seçer.

/** Tarayıcının kendi onay penceresini kullanır (sitedeki davranışla aynı). */
export function confirmDestructive(title: string, message: string): Promise<boolean> {
  return Promise.resolve(window.confirm(title + '\n\n' + message));
}
