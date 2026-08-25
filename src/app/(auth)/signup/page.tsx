import type { Metadata } from "next";
import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Crea tu cuenta" };

export default function SignupPage() {
  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">Crea tu cuenta</h1>
      <p className="mb-6 text-sm text-neutral-600">
        Publica el menú digital de tu restaurante gratis.
      </p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-neutral-600">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="font-medium text-neutral-900 underline">
          Inicia sesión
        </a>
      </p>
    </>
  );
}
