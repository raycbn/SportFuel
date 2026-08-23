import { useEffect } from "react";
import { useFuelAuth } from "@/contexts/AuthContext";
import { consumeHandoffFromUrl } from "@/lib/handoff";

export function HandoffConsumer() {
  const { handoffLogin, firebaseReady } = useFuelAuth();

  useEffect(() => {
    if (!firebaseReady) return;
    const token = consumeHandoffFromUrl();
    if (!token) return;
    handoffLogin(token).catch(() => {
      // Handoff failed: fallback to independent Fuel mode.
      // Token already removed from URL by consumeHandoffFromUrl.
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firebaseReady]);

  return null;
}
