import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ayuda — MICROCORE | Elemental Bloom",
  description:
    "Preguntas frecuentes, envíos, garantía y términos de MICROCORE, el probiótico termorresistente en polvo de Elemental Bloom.",
};

const CONTACT_EMAIL = "hola@elementalbloomco.com";

const faqs = [
  {
    q: "¿Qué es MICROCORE?",
    a: "Es un probiótico termorresistente en polvo para tu microbiota, desarrollado en Uruguay. Una sola cucharada diaria, sin cápsulas, que podés tomar en frío o en caliente.",
  },
  {
    q: "¿Cómo se toma?",
    a: "Una cucharada (20 g) por día, disuelta en un vaso de agua (200 mL) o mezclada en lo que ya tomás: yogur, avena, smoothie, jugo, mate o café.",
  },
  {
    q: "¿Por qué resiste el calor?",
    a: "MICROCORE usa Bacillus coagulans GBI-30 6086 esporulado: la espora protege al probiótico, por eso tolera líquidos calientes hasta 80 °C sin perder viabilidad.",
  },
  {
    q: "¿Necesita heladera?",
    a: "No. Al ser un probiótico esporulado es estable a temperatura ambiente. Guardalo en un lugar fresco y seco, con el pouch bien cerrado.",
  },
  {
    q: "¿Quién puede tomarlo?",
    a: "MICROCORE es un suplemento alimenticio, no un medicamento. Si estás embarazada, en período de lactancia, tomás medicación o tenés una condición de salud, consultá con tu médico o nutricionista antes de incorporarlo. Nada de lo que leas acá reemplaza el consejo de un profesional.",
  },
  {
    q: "¿Cómo pago?",
    a: "El pago se procesa a través de Mercado Pago, con los medios de pago disponibles en su plataforma. Al confirmar la compra te redirigimos a su checkout seguro.",
  },
  {
    q: "¿Cómo llega mi pedido?",
    a: "Hacemos envíos a todo Uruguay. El costo y el plazo del envío se confirman al finalizar la compra, y te avisamos por correo cuando tu pedido esté en camino.",
  },
];

function HelpSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-28">
      <h2 className="text-2xl font-bold tracking-tight mb-6">{title}</h2>
      {children}
    </section>
  );
}

export default function AyudaPage() {
  return (
    <main className="bg-surface-1 text-foreground">
      <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
        <header className="mb-16">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground underline underline-offset-4 hover:text-foreground transition-colors"
          >
            Volver al inicio
          </Link>
          <p className="mt-10 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Microcore · Ayuda
          </p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight sm:text-5xl">
            ¿En qué te podemos ayudar?
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Respuestas sobre el producto, los envíos, la garantía y los
            términos. Si no encontrás lo que buscás, escribinos a{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-foreground underline underline-offset-4"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </header>

        <div className="flex flex-col gap-20">
          <HelpSection id="faq" title="Preguntas frecuentes">
            <dl className="divide-y divide-border">
              {faqs.map((item) => (
                <div key={item.q} className="py-6 first:pt-0 last:pb-0">
                  <dt className="text-base font-semibold">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {item.a}
                  </dd>
                </div>
              ))}
            </dl>
          </HelpSection>

          <HelpSection id="envios" title="Envíos">
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Hacemos envíos a todo Uruguay. El costo y el plazo se confirman
                al finalizar la compra.
              </p>
              <p>
                ¿Dudas sobre tu envío? Escribinos a{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                con tu referencia de pago y te respondemos lo antes posible.
              </p>
            </div>
          </HelpSection>

          <HelpSection id="garantia" title="Garantía">
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                Si tu pedido llega dañado, incompleto o no es lo que compraste,
                escribinos a{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                apenas lo recibas, contándonos qué pasó (si podés, con una
                foto).
              </p>
              <p>
                Lo resolvemos con una reposición del producto o el reembolso de
                tu compra, según el caso.
              </p>
            </div>
          </HelpSection>

          <HelpSection id="terminos" title="Términos">
            <div className="flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground">
              <p>
                MICROCORE es un suplemento alimenticio, no un medicamento. La
                información de este sitio no constituye consejo médico ni
                reemplaza la consulta con un profesional de la salud.
              </p>
              <p>Producto en proceso de registro.</p>
              <p>
                Las compras se procesan a través de Mercado Pago, que gestiona
                el pago según sus propios términos y condiciones.
              </p>
              <p>
                Por cualquier consulta sobre estos términos, escribinos a{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-foreground underline underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </div>
          </HelpSection>
        </div>
      </div>
    </main>
  );
}
