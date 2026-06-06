import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Percy from "./Percy";
import LoginScreen from "./components/LoginScreen";
import SpinnerCoin from "./components/SpinnerCoin";
import ErrorBoundary from "./components/ErrorBoundary";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    let mounted = true;
    const timeout = setTimeout(() => {
      if (mounted) setSession(null);
    }, 5000);

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        clearTimeout(timeout);
        setSession(session);
      }
    }).catch(err => {
      if (mounted) {
        clearTimeout(timeout);
        setSession(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSession(session);
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  if (session === undefined) return <SpinnerCoin />;
  if (!session)              return <LoginScreen />;
  return <ErrorBoundary><Percy session={session} /></ErrorBoundary>;
}
