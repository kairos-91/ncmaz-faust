"use client";

import { useState } from "react";
import { ChevronDown, LayoutDashboard, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const FAQS = [
  {
    question: "Tengo un emprendimiento, ¿igual puedo registrarme?",
    answer:
      "Claro que sí. Levery fue pensada para restaurantes grandes, medianos y pequeños, y también para emprendimientos que están empezando.",
  },
  {
    question: "¿Puedo marcar un plato que ya no tengo disponible?",
    answer:
      "Sí. Desde tu panel puedes marcar cualquier plato como agotado con un clic, o eliminarlo por completo si ya no lo vas a ofrecer.",
  },
  {
    question: "¿Puedo probar antes de pagar?",
    answer:
      "¡Claro! Tienes 15 días gratis para conocer la app y probar todas sus funciones. Si te gusta (seguro que sí), activas tu suscripción cuando quieras.",
  },
  {
    question: "¿Puedo actualizar mi menú cuando quiera?",
    answer:
      "Sí. Ingresas a tu cuenta, haces los cambios y se actualizan al instante. Tú decides cuándo cambiar precios, fotos o platos, sin depender de nadie.",
  },
  {
    question: "¿Tengo que saber de diseño o programación?",
    answer:
      "Para nada. Levery es tan fácil de usar como llenar un formulario. Subes tus platos, pones precios, eliges tu color de marca... ¡y listo! Menú digital al instante.",
  },
  {
    question: "¿Necesito una computadora o puedo hacerlo desde el celular?",
    answer:
      "Puedes usar Levery desde donde te quede más cómodo: celular, tablet o computadora. ¡Tú eliges!",
  },
  {
    question: "¿Puedo agregar fotos de mis platos?",
    answer:
      "¡Claro! Las fotos hacen que tu menú se vea más apetitoso y profesional. Puedes subirlas directamente desde tu galería.",
  },
  {
    question: "¿Puedo organizar mi menú por categorías?",
    answer:
      "Sí. Puedes crear las categorías que necesites (Entradas, Postres, Bebidas, o lo que quieras) y ordenarlas como prefieras. Todo bien organizado para tus clientes.",
  },
  {
    question: "¿Mi menú tiene un link único?",
    answer:
      "Sí. Tendrás un enlace personalizado con el nombre de tu restaurante para compartir por WhatsApp, Instagram o donde quieras. También puedes imprimir tu código QR.",
  },
  {
    question: "¿Puedo destacar promociones o platos del día?",
    answer:
      "Sí. Puedes marcar cualquier plato como destacado para que resalte en tu menú, ideal para promociones o platos del día.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-white py-20 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold uppercase tracking-wide text-neutral-900 dark:text-white sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <span className="mx-auto mt-3 block h-1 w-16 rounded-full bg-lime-500 dark:bg-lime-400" />
          <p className="mx-auto mt-6 max-w-xl text-neutral-600 dark:text-neutral-400">
            Explora las dudas más comunes y descubre cómo funciona Levery.
          </p>
        </div>

        <div className="mt-14 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-start">
          <div className="space-y-3">
            {FAQS.map((faq) => (
              <FaqItem key={faq.question} {...faq} />
            ))}
          </div>

          <FaqIllustration />
        </div>
      </div>
    </section>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
      >
        <span className="text-sm font-semibold text-neutral-900 dark:text-white">
          {question}
        </span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-lime-600 transition-transform dark:text-lime-400",
            open && "rotate-180",
          )}
        />
      </button>
      {open && (
        <p className="px-5 pb-4 text-sm text-neutral-600 dark:text-neutral-400">
          {answer}
        </p>
      )}
    </div>
  );
}

function FaqIllustration() {
  return (
    <div className="hidden rounded-3xl bg-neutral-50 p-10 dark:bg-neutral-900 lg:flex lg:items-center lg:justify-center">
      <div className="relative w-full max-w-[220px]">
        <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950">
          <div className="flex h-6 items-center gap-1.5 border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <span className="h-2 w-2 rounded-full bg-red-300" />
            <span className="h-2 w-2 rounded-full bg-yellow-300" />
            <span className="h-2 w-2 rounded-full bg-lime-400" />
          </div>
          <div className="mt-3 space-y-2">
            <div className="h-3 w-2/3 rounded-full bg-lime-100 dark:bg-lime-400/20" />
            <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800" />
            <div className="h-2 w-5/6 rounded-full bg-neutral-100 dark:bg-neutral-800" />
            <div className="mt-3 h-16 rounded-xl bg-neutral-100 dark:bg-neutral-800" />
          </div>
        </div>
        <div className="absolute -bottom-5 -left-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-400 text-neutral-950 shadow-md">
          <Users className="h-5 w-5" />
        </div>
        <div className="absolute -right-5 -top-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-neutral-900 text-lime-400 shadow-md dark:bg-white dark:text-neutral-900">
          <LayoutDashboard className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}
