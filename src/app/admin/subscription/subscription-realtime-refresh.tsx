"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// La aprobación del pago puede pasar en segundo plano (la notificación
// del banco llega minutos después de que el restaurante reportó el
// pago), fuera del ciclo de esta pestaña — sin esto, "Tu plan actual"
// se queda con los días viejos hasta que el usuario recarga a mano.
export function SubscriptionRealtimeRefresh({ restaurantId }: { restaurantId: string }) {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // Mismo patrón que orders-button.tsx: espera la sesión antes de
    // suscribirse, si no el canal se autentica como anónimo y RLS le
    // bloquea los cambios.
    supabase.auth.getSession().then(() => {
      if (cancelled) return;
      channel = supabase
        .channel(`restaurant-plan-${restaurantId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "restaurants",
            filter: `id=eq.${restaurantId}`,
          },
          () => router.refresh(),
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [restaurantId, router]);

  return null;
}
