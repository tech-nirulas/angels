import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import CategoriesSection from "@/components/sections/CategoriesSection";
import FeaturedSection from "@/components/sections/FeaturedSection";
import HeroSection from "@/components/sections/HeroSection";
import MenuSection from "@/components/sections/MenuSection";
import OrderSection from "@/components/sections/OrderSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <CategoriesSection />
        <MenuSection />
        <FeaturedSection />
        {/* <StorySection /> */}
        {/* <TestimonialsSection /> */}
        <OrderSection />
      </main>
      <Footer />
    </>
  );
}