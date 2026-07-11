import HeroesSection from "@/components/home/heroes";
import SectionOne from "@/components/home/sectionOne";

// Icons stay in the component; the matching copy lives in messages/<locale>/home.json
// under `how.steps`, paired with each icon by index via `stepKeys`.

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <HeroesSection />
      <SectionOne />
    </>
  );
}
