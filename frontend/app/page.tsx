import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import JudgeInbox from "@/components/JudgeInbox";
import VerificationTiers from "@/components/VerificationTiers";
import StellarBar from "@/components/StellarBar";
import CtaSection from "@/components/CtaSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <JudgeInbox />
        <VerificationTiers />
        <StellarBar />
        <CtaSection />
      </main>
      <Footer />
    </>
  );
}
