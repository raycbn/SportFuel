import { useEffect } from "react";
import { useFuelAuth } from "@/contexts/AuthContext";
import { consumeHandoffFromUrl } from "@/lib/handoff";

export function HandoffConsumer() {
  const { handoffLogin, firebaseReady, logout } = useFuelAuth();

  useEffect(() => {
    // Always remove the one-time token from the address bar, even when Firebase
    // is unavailable. In that case the user must authenticate normally.
    const token = consumeHandoffFromUrl();
    if (!token || !firebaseReady) return;

    void handoffLogin(token).catch(async () => {
      // A failed handoff must not leave a previous Fuel account active. That
      // could expose the wrong user's profile or Premium entitlement.
      try {
        await logout();
      } catch {
        // RequireFuelAuth will keep protected routes locked after a sign-out error.
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseReady]);

  return null;
}
