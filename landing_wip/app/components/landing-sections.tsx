import { Microbiota } from "./microbiota";
import { MicrocoreCard } from "./microcore-card";
import { Testimonial } from "./testimonial";
import { FunctionalIngredient } from "./functional-ingredient";
import { Supporters } from "./supporters";
import { OriginStory } from "./origin-story";
import { ScienceBlog } from "./science-blog";
import { Community } from "./community";
import { Footer } from "./footer";

/**
 * Marketing sections ported from `landing_frame/app/page.tsx`, stacked below
 * the particle-scroll hero on the homepage. `Nav` is intentionally omitted
 * (the floating NavbarPill in the root layout owns navigation) and the simple
 * split `Hero` is dropped (the particle scene + 3D pouch is the hero now).
 */
export function LandingSections() {
  return (
    <>
      <main>
        <Microbiota />
        <MicrocoreCard />
        <Testimonial />
        <FunctionalIngredient />
        <Supporters />
        <OriginStory />
        <ScienceBlog />
        <Community />
      </main>
      <Footer />
    </>
  );
}
