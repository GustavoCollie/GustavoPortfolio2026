/**
 * ─────────────────────────────────────────────────────────────
 *  TEMA — preferencia contra pintado
 *
 *  Hay DOS valores, y confundirlos es la fuente de todos los bugs
 *  de este archivo:
 *
 *  · `data-tema-base`  lo que la persona eligió (o su sistema).
 *                      Sólo lo cambia el conmutador. Persiste.
 *  · `data-theme`      lo que se está pintando ahora mismo.
 *                      Es lo que lee globals.css.
 *
 *  Normalmente son iguales. Dejan de serlo cuando una <Escena>
 *  invertida ocupa el encuadre: ahí se pinta el tema contrario sin
 *  tocar la preferencia, así que al salir se vuelve solo.
 *
 *  Por eso el conmutador escribe la BASE, nunca el pintado: si
 *  escribiera el pintado, cambiar de tema dentro de una escena
 *  invertida guardaría la preferencia del revés.
 * ─────────────────────────────────────────────────────────────
 */

export type Tema = "dark" | "light";

export const opuesto = (t: Tema): Tema => (t === "dark" ? "light" : "dark");

/** Escenas invertidas visibles ahora mismo. Es un contador y no un
 *  booleano porque dos escenas pueden solaparse al hacer scroll rápido:
 *  con un booleano, la primera en salir apagaría la inversión de la otra. */
let escenasInvertidas = 0;

let temporizador: number | undefined;

export function temaBase(): Tema {
  return document.documentElement.dataset.temaBase === "light"
    ? "light"
    : "dark";
}

/**
 * Pinta un tema con fundido.
 *
 * `escena` elige el fundido corto y barato (sólo color, borde y fondo):
 * el cambio por escena ocurre durante el scroll, así que no puede
 * permitirse animar también sombras y rellenos de SVG.
 */
function pintar(tema: Tema, escena: boolean) {
  const root = document.documentElement;
  if (root.dataset.theme === tema) return;

  const clase = escena ? "theme-escena" : "theme-switching";
  root.classList.add(clase);
  root.dataset.theme = tema;

  window.clearTimeout(temporizador);
  temporizador = window.setTimeout(() => {
    root.classList.remove("theme-switching", "theme-escena");
  }, escena ? 620 : 500);
}

/** Recalcula el pintado a partir de la base y las escenas activas. */
export function sincronizar(escena = false) {
  const base = temaBase();
  pintar(escenasInvertidas > 0 ? opuesto(base) : base, escena);
}

/** Cambia la preferencia y repinta. Lo llama el conmutador. */
export function fijarBase(tema: Tema) {
  document.documentElement.dataset.temaBase = tema;
  try {
    localStorage.setItem("tema", tema);
  } catch {
    // Modo incógnito o almacenamiento bloqueado: el tema dura la sesión.
  }
  sincronizar();
}

export function entrarEscena() {
  escenasInvertidas += 1;
  sincronizar(true);
}

export function salirEscena() {
  escenasInvertidas = Math.max(0, escenasInvertidas - 1);
  sincronizar(true);
}
