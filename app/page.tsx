import { Hero } from "@/components/home/hero";
import { Categories } from "@/components/home/categories";
import { BestSellers } from "@/components/home/best-sellers";
import { EditorialBanner } from "@/components/home/editorial-banner";
import { Lookbook } from "@/components/home/lookbook";
import { BrandStory } from "@/components/home/brand-story";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramGrid } from "@/components/home/instagram-grid";
import { Newsletter } from "@/components/home/newsletter";
import { Reveal } from "@/components/layout/reveal";

export default function Home() {
  return (
    <main>
      {/* Hero is above the fold — it should be visible immediately, not
          faded in, so it's the one section left outside <Reveal>. */}
      <Hero />
      <Reveal><Categories /></Reveal>
      <Reveal><BestSellers /></Reveal>
      <Reveal><EditorialBanner /></Reveal>
      <Reveal><Lookbook /></Reveal>
      <Reveal><BrandStory /></Reveal>
      <Reveal><Testimonials /></Reveal>
      <Reveal><InstagramGrid /></Reveal>
      <Reveal><Newsletter /></Reveal>
    </main>
  );
}
