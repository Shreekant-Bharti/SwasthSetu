import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Dashboards from "@/components/Dashboards";
import Features from "@/components/Features";
import DifferenceSection from "@/components/DifferenceSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Dashboards />
      <Features />
      <DifferenceSection />
      <Footer />
    </div>
  );
};

export default Index;
