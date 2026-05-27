import { Nav } from "./components/nav";
import { Hero } from "./components/hero";
import { Microbiota } from "./components/microbiota";
import { MicrocoreCard } from "./components/microcore-card";
import { Testimonial } from "./components/testimonial";
import { FunctionalIngredient } from "./components/functional-ingredient";
import { OriginStory } from "./components/origin-story";
import { ScienceBlog } from "./components/science-blog";
import { Community } from "./components/community";
import { Footer } from "./components/footer";

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Microbiota />
        <MicrocoreCard />
        <Testimonial />
        <FunctionalIngredient />
        <OriginStory />
        <ScienceBlog />
        <Community />
      </main>
      <Footer />
    </>
  );
}
