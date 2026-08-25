import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Inicia sesión" };

export default function LoginPage() {
  return (
    <>
      <h1 className="mb-1 text-lg font-semibold">Inicia sesión</h1>
      <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
        Administra el menú de tu restaurante.
      </p>
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
        ¿No tienes cuenta?{" "}
        <a href="/signup" className="font-medium text-neutral-900 underline dark:text-white">
          Regístrate
        </a>
      </p>
    </>
  );
}
