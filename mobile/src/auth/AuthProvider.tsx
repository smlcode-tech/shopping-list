// Oturum durumunu tüm uygulamaya dağıtan bağlam (context).
// Sitedeki onAuthStateChange dinleyicisinin karşılığıdır: App.tsx bu durumla giriş ekranı ile
// uygulama ekranları arasında geçiş yapar.
import type { Session } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { supabase } from '../lib/supabase';

type AuthState = {
  session: Session | null;
  /** Saklı oturum henüz okunmadıysa true; bu sürede giriş ekranı gösterilmez ki göz kırpmasın. */
  loading: boolean;
};

const AuthContext = createContext<AuthState>({ session: null, loading: true });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ session: null, loading: true });

  useEffect(() => {
    let active = true;
    // Uygulama açılırken AsyncStorage'daki oturumu oku.
    supabase.auth.getSession().then(({ data }) => {
      if (active) setState({ session: data.session, loading: false });
    });
    // Giriş, çıkış ve token yenilemelerinde güncelle.
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active) setState({ session, loading: false });
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export const useAuth = (): AuthState => useContext(AuthContext);
