"use client";

import { useActionState, useState } from "react";
import { motion } from "motion/react";
import { perfil } from "@/data/content";
import { enviarMensaje } from "@/app/contacto/acciones";
import { ESTADO_INICIAL, type EstadoEnvio } from "@/app/contacto/tipos";
import { EASE_CINEMA } from "./kinetics";

const intereses = [
  "Gestión de producto",
  "Consultoría de negocio",
  "Business Intelligence",
  "Proyecto de software",
  "Posición full-time",
  "Otro",
];

/**
 * Formulario de contacto.
 *
 * Envía por Server Action a Resend. Si el entorno no tiene credenciales
 * —o el proveedor falla— ofrece el envío por cliente de correo con el
 * mensaje ya redactado: ningún contacto se pierde por infraestructura.
 */
export default function ContactForm() {
  const [estado, accion, enviando] = useActionState<EstadoEnvio, FormData>(
    enviarMensaje,
    ESTADO_INICIAL,
  );

  const [interes, setInteres] = useState(intereses[0]);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [mensaje, setMensaje] = useState("");

  const asunto = `[Portafolio] ${interes}${empresa ? ` — ${empresa}` : ""}`;
  const cuerpo = `Hola Gustavo,\n\n${mensaje}\n\n—\n${nombre}${
    empresa ? `\n${empresa}` : ""
  }${email ? `\n${email}` : ""}`;
  const mailto = `mailto:${perfil.email}?subject=${encodeURIComponent(
    asunto,
  )}&body=${encodeURIComponent(cuerpo)}`;

  const sinConfigurar = estado.estado === "sin-configurar";

  if (estado.estado === "ok") {
    return (
      <motion.div
        role="status"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: EASE_CINEMA }}
        className="flex min-h-[420px] flex-col justify-center border border-line-2 bg-surface p-9 text-center"
      >
        <span className="mx-auto mb-7 grid h-14 w-14 place-items-center border border-line-2 text-ink-100">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="m5 12.5 4.5 4.5L19 7.5"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="display text-3xl text-ink-100">Recibido</p>
        <p className="mx-auto mt-4 max-w-sm text-[0.9375rem] leading-relaxed text-ink-300">
          {estado.mensaje}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.form
      action={accion}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: EASE_CINEMA }}
      className="relative border border-line-2 bg-surface p-7 md:p-9"
    >
      {/* Trampa para bots: invisible y fuera del orden de tabulación. */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden>
        <label htmlFor="web">No rellenar</label>
        <input id="web" name="web" tabIndex={-1} autoComplete="off" />
      </div>

      <fieldset className="mb-8">
        <legend className="label-mono mb-4">¿Sobre qué escribes?</legend>
        <input type="hidden" name="interes" value={interes} />
        <div className="flex flex-wrap gap-2">
          {intereses.map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setInteres(i)}
              aria-pressed={interes === i}
              className={`border px-4 py-2 text-[0.8125rem] transition ${
                interes === i
                  ? "bg-accent text-accent-contra"
                  : "border border-line-2 text-ink-300 hover:border-line-3 hover:text-ink-100"
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo
          name="nombre"
          label="Nombre"
          value={nombre}
          onChange={setNombre}
          placeholder="Tu nombre"
          autoComplete="name"
          error={estado.errores?.nombre}
        />
        <Campo
          name="email"
          type="email"
          label="Correo"
          value={email}
          onChange={setEmail}
          placeholder="tucorreo@empresa.com"
          autoComplete="email"
          error={estado.errores?.email}
        />
      </div>

      <div className="mt-5">
        <Campo
          name="empresa"
          label="Empresa (opcional)"
          value={empresa}
          onChange={setEmpresa}
          placeholder="Organización"
          autoComplete="organization"
        />
      </div>

      <div className="mt-5">
        <label htmlFor="mensaje" className="label-mono mb-2 block">
          Mensaje
        </label>
        <textarea
          id="mensaje"
          name="mensaje"
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          rows={5}
          aria-invalid={Boolean(estado.errores?.mensaje)}
          placeholder="Cuéntame el contexto: qué problema hay que resolver y en qué plazo."
          className={`w-full resize-none border-0 border-b bg-transparent px-0 py-3 text-[1rem] md:text-[0.9375rem] text-ink-100 outline-none transition placeholder:text-ink-500 ${
            estado.errores?.mensaje
              ? "border-ink-100"
              : "border-line-2 focus:border-ink-100"
          }`}
        />
        {estado.errores?.mensaje && (
          <p className="mt-2 text-[0.75rem] font-medium text-ink-100">
            {estado.errores.mensaje}
          </p>
        )}
      </div>

      <div className="mt-7 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={enviando}
          className="group inline-flex items-center gap-3 bg-accent px-7 py-3.5 text-[0.875rem] font-medium text-accent-contra transition hover:opacity-85 disabled:pointer-events-none disabled:opacity-50"
        >
          {enviando ? "Enviando…" : "Enviar mensaje"}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            className={
              enviando
                ? "animate-pulse"
                : "transition-transform duration-500 group-hover:translate-x-1"
            }
          >
            <path
              d="M2 7h10M8 3l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {(sinConfigurar || estado.estado === "error") && (
          <a
            href={mailto}
            className="inline-flex items-center border border-line-2 px-6 py-3.5 text-[0.8125rem] text-ink-200 transition hover:border-line-3 hover:bg-surface-2"
          >
            Abrir en mi correo
          </a>
        )}
      </div>

      <p
        aria-live="polite"
        className={`mt-4 text-[0.8125rem] ${
          estado.estado === "error" || sinConfigurar
            ? "text-ink-100"
            : "text-ink-500"
        }`}
      >
        {estado.mensaje ||
          "Respondo en menos de 24 h hábiles. Sin listas de correo ni seguimientos automáticos."}
      </p>
    </motion.form>
  );
}

function Campo({
  name,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  autoComplete,
  error,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="label-mono mb-2 block">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        /* 16 px en móvil y 15 en escritorio no es un descuido: por debajo
           de 16 px, Safari en iOS amplía la página al enfocar un campo y
           la deja descuadrada, sin forma de volver. El grado de diferencia
           no se nota; el zoom sí. */
        className={`w-full border-0 border-b bg-transparent px-0 py-3 text-[1rem] md:text-[0.9375rem] text-ink-100 outline-none transition placeholder:text-ink-500 ${
          error ? "border-ink-100" : "border-line-2 focus:border-ink-100"
        }`}
      />
      {error && <p className="mt-2 text-[0.75rem] font-medium text-ink-100">{error}</p>}
    </div>
  );
}
