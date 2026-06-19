import { SectionReveal } from "./section-reveal";

/**
 * MICRO CORE product section — adopted from the EB-web-02 Figma: a full-bleed
 * burgundy block (rounded top, lime strip at the bottom) with the pouch-on-
 * pedestal render centred, the headline + clinical copy on the left, and the
 * "5 en 1" ingredient badges on the right.
 *
 * Badge icons are the EXACT Figma SVGs (public/images/badges/*), which carry
 * their own colours (#7A2F4B glyphs on the #C8F670 lime circle) as <img>.
 */
const LIME = "#C8F670"; // exact Figma badge lime
const WINE = "#7A2F4B"; // exact Figma glyph wine (used for the Zn text)
const LABEL = "#f0f1e5"; // exact Figma badge label cream

const badges = [
  {
    label: "Probiótico esporulado",
    icon: <img src="/images/badges/probiotico.svg" alt="" className="w-[48%]" />,
  },
  {
    label: "Prebiótico",
    icon: <img src="/images/badges/prebiotico.svg" alt="" className="w-[56%]" />,
  },
  {
    label: "Colágeno",
    icon: <img src="/images/badges/colageno.svg" alt="" className="w-full" />,
  },
  {
    label: "Açaí",
    icon: <img src="/images/badges/acai.svg" alt="" className="w-full" />,
  },
  {
    label: "Hongo funcional",
    icon: <img src="/images/badges/hongo.svg" alt="" className="h-[48%]" />,
  },
  {
    label: "Zinc",
    icon: (
      <span className="text-[17px] font-semibold leading-none" style={{ color: WINE }}>
        Zn
      </span>
    ),
  },
];

export function MicrocoreShowcase() {
  return (
    <section className="bg-surface-1">
      <div className="relative rounded-t-[2.5rem] bg-bordeaux text-bordeaux-foreground">
        <SectionReveal>
          <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 px-6 py-16 xl:min-h-[484px] xl:flex-row xl:gap-8 xl:py-0">
            {/* LEFT — copy */}
            <div className="flex w-full flex-col gap-6 xl:flex-1">
              <h2 className="whitespace-nowrap text-4xl font-bold tracking-tight xl:text-[2.5rem]">
                MICRO CORE
              </h2>
              <p className="text-lg font-medium leading-snug">
                Una sola cucharada. Cinco funciones.
                <br />
                Sin cápsulas.
              </p>
              <p className="max-w-md leading-relaxed text-bordeaux-foreground/80">
                Frío o caliente, llega activo igual. Estudios clínicos
                demostraron que esta cepa (Bacillus Coagulans) favorece la
                absorción de aminoácidos. Más proteína aprovechada, misma
                porción.
              </p>
              <div className="pt-2">
                <a
                  href="#ingredientes"
                  className="inline-flex h-12 items-center rounded-full bg-[#fff6ef] px-7 text-[15px] text-bordeaux transition-[transform,filter] duration-100 hover:brightness-[0.97] active:scale-[0.98]"
                >
                  Conocer&nbsp;<span className="font-semibold">MICROCORE</span>
                </a>
              </div>
            </div>

            {/* CENTER — product render. On desktop it breaks out above the
                burgundy top edge (the Figma "Clip path group" overflow): the
                column reserves the width while the bottom-anchored image is
                taller than the row, so the pouch pokes up past the top. */}
            <div className="relative flex w-full shrink-0 justify-center xl:block xl:w-[clamp(260px,21vw,285px)] xl:self-stretch">
              <img
                src="/images/product-pedestal.webp"
                alt="Pouch de MICROKORE sobre pedestal con açaí y cacao"
                className="w-[clamp(336px,86vw,504px)] xl:absolute xl:bottom-[-40px] xl:left-1/2 xl:w-[175%] xl:max-w-none xl:-translate-x-1/2"
              />
            </div>

            {/* RIGHT — 5 en 1 pills + ingredient badges */}
            <div className="flex w-full flex-col gap-7 xl:w-auto xl:shrink-0 xl:items-start">
              <div className="flex flex-wrap items-center gap-3">
                <span className="relative inline-flex h-9 items-center rounded-full border border-bordeaux-foreground/40 pl-9 pr-4 text-sm">
                  <span className="absolute -left-px top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-bordeaux-foreground/40 bg-bordeaux">
                    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round">
                      <path d="M8 2v12M2.5 5l11 6M13.5 5l-11 6" />
                    </svg>
                  </span>
                  5 en 1
                </span>
                <span className="inline-flex h-9 items-center rounded-full border border-bordeaux-foreground/40 px-4 text-sm font-semibold">
                  MICRO CORE
                </span>
              </div>
              <div className="grid grid-cols-3 gap-x-1.5 gap-y-5 sm:grid-cols-6">
                {badges.map((b) => (
                  <div key={b.label} className="flex w-[78px] flex-col items-center gap-2 text-center">
                    <span
                      className="relative flex h-14 w-14 items-center justify-center rounded-full"
                      style={{ backgroundColor: LIME }}
                    >
                      {b.icon}
                    </span>
                    <span
                      className="text-[10px] font-medium uppercase leading-tight tracking-[0.04em]"
                      style={{ color: LABEL }}
                    >
                      {b.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* lime base strip */}
        <div className="h-3 w-full" style={{ backgroundColor: LIME }} />
      </div>
    </section>
  );
}
