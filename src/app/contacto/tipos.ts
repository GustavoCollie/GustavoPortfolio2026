/**
 * Tipos y estado inicial del formulario.
 *
 * Van aparte de `acciones.ts` porque un módulo con "use server" sólo puede
 * exportar funciones async: cualquier constante exportada desde ahí revienta
 * en tiempo de ejecución, no en el build.
 */
export type EstadoEnvio = {
  estado: "inicial" | "ok" | "error" | "sin-configurar";
  mensaje: string;
  /** Errores por campo, para marcarlos en el formulario. */
  errores?: Partial<Record<"nombre" | "email" | "mensaje", string>>;
};

export const ESTADO_INICIAL: EstadoEnvio = { estado: "inicial", mensaje: "" };
