import { Microbiota } from "./microbiota";
import { MicrocoreCard } from "./microcore-card";
import { MicrocoreShowcase } from "./microcore-showcase";
import { Testimonial } from "./testimonial";
import { FunctionalIngredient } from "./functional-ingredient";
import { Supporters } from "./supporters";
import { OriginStory } from "./origin-story";
import { ScienceBlog } from "./science-blog";
import { Community } from "./community";
import { ClosingCta } from "./closing-cta";
import { Footer } from "./footer";

/**
 * Marketing sections ported from `landing_frame/app/page.tsx`, stacked below
 * the particle-scroll hero on the homepage. `Nav` is intentionally omitted
 * (the Navbar in the root layout owns navigation) and the simple
 * split `Hero` is dropped (the particle scene + 3D pouch is the hero now).
 */
export function LandingSections() {
  return (
    <>
      <main>
        <div id="microbiota" className="scroll-mt-24">
          <Microbiota />
        </div>
        <div id="producto" className="scroll-mt-24">
          <MicrocoreCard />
        </div>
        {/* Figma MICRO CORE section, stacked alongside the current card for A/B. */}
        <MicrocoreShowcase />
        <Testimonial />
        <div id="ingredientes" className="scroll-mt-24">
          <FunctionalIngredient />
        </div>
        <Supporters />
        <div id="origen" className="scroll-mt-24">
          <OriginStory />
        </div>
        <div id="blog" className="scroll-mt-24">
          <ScienceBlog />
        </div>
        <div id="comunidad" className="scroll-mt-24">
          <Community />
        </div>
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
