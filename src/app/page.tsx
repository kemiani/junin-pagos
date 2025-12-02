import { GradientBackground } from "@/components/server/GradientBackground";
import { Header } from "@/components/server/Header";
import { Hero } from "@/components/server/Hero";
import { Services } from "@/components/server/Services";
import { Advantages } from "@/components/server/Advantages";
import { FAQ } from "@/components/server/FAQ";
import { CTA } from "@/components/server/CTA";
import { Contact } from "@/components/server/Contact";
import { Footer } from "@/components/server/Footer";
import { WhatsAppButton } from "@/components/server/WhatsAppButton";

export default function Home() {
  return (
    <div className="min-h-screen">
      <GradientBackground />
      
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      <Header />

      <main id="main-content">
        <Hero />
        <Services />
        <Advantages />
        <FAQ />
        <CTA />
        <Contact />
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  );
}
