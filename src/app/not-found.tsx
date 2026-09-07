import Link from "next/link";

export default function NotFound() {
  return (
    <section className="shell flex min-h-[80vh] flex-col justify-center py-32">
      <p className="label-mono mb-6 text-accent/80">Error 404</p>
      <h1 className="display text-[clamp(3rem,10vw,7rem)] text-ink-100">
        Plano no encontrado
      </h1>
      <p className="mt-6 max-w-md text-[1.0625rem] leading-relaxed text-ink-300">
        La página que buscas no existe o cambió de dirección. Volvamos al inicio
        del recorrido.
      </p>
      <Link
        href="/"
        className="mt-10 inline-flex w-fit items-center gap-3 rounded-full bg-ink-100 px-7 py-3.5 text-[0.875rem] font-medium text-ink-950 transition hover:bg-accent hover:text-accent-contra"
      >
        Volver al home
      </Link>
    </section>
  );
}
