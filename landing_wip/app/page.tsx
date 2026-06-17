import { HeroSplit } from "./hero-split";
import { LandingSections } from "./components/landing-sections";
import { PRODUCT } from "@/lib/product";

const productJsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "MICROCORE",
  brand: {
    "@type": "Brand",
    name: "Elemental Bloom",
  },
  description:
    "Probiótico termorresistente en polvo para tu microbiota. Una cucharada diaria, en frío o caliente: café, smoothie o yogur. Hecho en Uruguay.",
  image: "https://elementalbloomco.com/images/product-pedestal.webp",
  offers: {
    "@type": "Offer",
    price: PRODUCT.unitPrice,
    priceCurrency: PRODUCT.currencyId,
    availability: "https://schema.org/InStock",
    url: "https://elementalbloomco.com/#producto",
  },
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <div id="inicio" className="scroll-mt-24">
        <HeroSplit />
      </div>
      <LandingSections />
    </>
  );
}
