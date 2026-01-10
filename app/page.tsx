import {
  Benefits,
  FAQ,
  Features,
  Footer,
  Hero,
  MenuSidebar,
  Pricing,
  Security,
} from "@/components/landing-page";

const LandingPage = () => {
  return (
    <main className="min-h-screen">
      <MenuSidebar />
      <Hero />
      <Benefits />
      <Features />
      <Pricing />
      <Security />
      <FAQ />
      <Footer />
    </main>
  );
};

export default LandingPage;
