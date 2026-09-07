/** Tipos del panel. Aparte de `acciones.ts` porque un módulo "use server"
 *  sólo puede exportar funciones async. */
export type EstadoSesion = {
  estado: "inicial" | "ok" | "error";
  mensaje: string;
};

export type EstadoAdmin = {
  estado: "inicial" | "ok" | "error" | "solo-lectura";
  mensaje: string;
};

export const SESION_INICIAL: EstadoSesion = { estado: "inicial", mensaje: "" };
export const ADMIN_INICIAL: EstadoAdmin = { estado: "inicial", mensaje: "" };
