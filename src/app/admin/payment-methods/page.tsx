import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwnerRestaurant } from "@/lib/get-owner-restaurant";
import { parsePaymentMethods } from "@/lib/payment-methods";
import { PaymentMethodsForm } from "./payment-methods-form";

export const metadata: Metadata = { title: "Métodos de pago" };

export default async function PaymentMethodsPage() {
  const { restaurant } = await getOwnerRestaurant();
  if (!restaurant) redirect("/admin");

  const values = parsePaymentMethods(restaurant.payment_methods);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Métodos de pago</h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Activa los métodos que aceptas y completa tus datos. Tus clientes
          los verán al armar su pedido en tu menú público.
        </p>
      </div>
      <PaymentMethodsForm restaurantId={restaurant.id} values={values} />
    </div>
  );
}
