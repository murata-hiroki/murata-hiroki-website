import { Suspense } from "react";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Notice from "@/components/Notice";
import About from "@/components/About";
import Chronicle from "@/components/Chronicle";
import Promises from "@/components/Promises";
import Activity from "@/components/Activity";
import Support from "@/components/Support";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <Hero />
      <Notice />
      <About />
      <Chronicle />
      <Promises />
      <Suspense fallback={<section className="activity" id="activity" style={{ minHeight: 320 }} />}>
        <Activity />
      </Suspense>
      <Support />
      <Footer />
    </>
  );
}
