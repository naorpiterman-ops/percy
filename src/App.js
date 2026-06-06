import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient";
import Percy from "./Percy";
import LoginScreen from "./components/LoginScreen";
import SpinnerCoin from "./components/SpinnerCoin";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) return <SpinnerCoin />;
  if (!session)              return <LoginScreen />;
  return <Percy session={session} />;
}
