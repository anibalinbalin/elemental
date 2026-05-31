"use client";

import { SectionReveal } from "./section-reveal";

const colLeft = [
  { label: "Microbiota", href: "#microbiota" },
  { label: "Producto", href: "#producto" },
  { label: "Ciencia", href: "#ciencia" },
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Origen", href: "#origen" },
  { label: "Comunidad", href: "#comunidad" },
];

const colRight = [
  { label: "Terminos", href: "#" },
  { label: "Garantia", href: "#" },
  { label: "Envios", href: "#" },
  { label: "FAQ", href: "#" },
];

function IconFacebook() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M9.198 21.5h4v-8.01h3.604l.396-3.98h-4V7.5a1 1 0 0 1 1-1h3v-4h-3a5 5 0 0 0-5 5v2.01h-2l-.396 3.98h2.396v8.01Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="17.5" cy="6.5" r="1.5" fill="white" stroke="none" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  );
}

export function Footer() {
  return (
    <footer style={{ backgroundColor: "#c5e847" }}>
      <div className="mx-auto max-w-7xl px-6 pt-16 lg:pt-24 pb-0">
        <SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-12 lg:gap-24 mb-16">
            {/* Left: newsletter + socials */}
            <div className="flex flex-col gap-6">
              <p className="text-lg italic text-black font-medium">
                Lo que se viene, primero aca
              </p>

              <form
                className="flex items-center w-full max-w-md rounded-full border border-black/30 bg-transparent overflow-hidden"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  type="email"
                  placeholder="mail"
                  className="flex-1 bg-transparent px-5 py-3 text-sm text-black placeholder:text-black/50 outline-none"
                />
                <button
                  type="submit"
                  className="bg-black text-white rounded-full px-6 py-2.5 text-sm font-medium mr-1 hover:opacity-80 transition-opacity shrink-0"
                >
                  Enviar
                </button>
              </form>

              <div className="flex gap-3 pt-2">
                <a
                  href="#"
                  aria-label="Facebook"
                  className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <IconFacebook />
                </a>
                <a
                  href="#"
                  aria-label="Instagram"
                  className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <IconInstagram />
                </a>
                <a
                  href="#"
                  aria-label="WhatsApp"
                  className="w-10 h-10 rounded-full bg-black flex items-center justify-center hover:opacity-80 transition-opacity"
                >
                  <IconWhatsApp />
                </a>
              </div>
            </div>

            {/* Right: nav columns */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-3">
              <div className="flex flex-col gap-3">
                {colLeft.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-black uppercase tracking-wider hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                {colRight.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-sm font-medium text-black uppercase tracking-wider hover:opacity-60 transition-opacity"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </SectionReveal>

        {/* Giant wordmark */}
        <div className="overflow-hidden">
          <p className="text-7xl lg:text-[11rem] font-bold tracking-tighter leading-[0.85] text-white select-none whitespace-nowrap translate-y-[15%]">
            elemental bloom
          </p>
        </div>
      </div>
    </footer>
  );
}
