import { HeroSection } from "./hero-section";
import { LandingSections } from "./components/landing-sections";
import { ParticleBand } from "./components/particle-band";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ParticleBand />
      <LandingSections />
    </>
  );
}
