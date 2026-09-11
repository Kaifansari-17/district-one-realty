import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { SearchBar } from "@/components/home/SearchBar";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2400&auto=format&fit=crop";

export function Hero() {
  const reduceMotion = useReducedMotion();
  const rise = (delay: number) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: "easeOut" as const },
        };

  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden bg-navy">
      <img
        src={HERO_IMAGE}
        alt="Modern residential architecture"
        loading="eager"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover opacity-80"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-navy/10" />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-16 pt-40 md:pb-20">
        <motion.p {...rise(0)} className="text-xs uppercase tracking-[0.3em] text-gold-light">
          District One Realty
        </motion.p>
        <motion.h1 {...rise(0.1)} className="mt-4 max-w-2xl font-serif text-4xl leading-tight text-white md:text-6xl">
          Find a Place
          <br />
          Worth Calling Home.
        </motion.h1>
        <motion.p {...rise(0.2)} className="mt-5 max-w-lg text-white/80">
          Exceptional residential and commercial properties across Navi Mumbai.
        </motion.p>

        <motion.div {...rise(0.3)} className="mt-6 flex flex-wrap items-center gap-4">
          <Link to="/properties" className="rounded-md bg-white px-6 py-3 text-sm font-medium text-navy transition hover:bg-gold-soft">
            Explore Properties
          </Link>
          <Link to="/contact" className="rounded-md border border-white/40 px-6 py-3 text-sm font-medium text-white transition hover:border-white">
            Talk to an Expert
          </Link>
        </motion.div>

        <motion.div {...rise(0.4)} className="mt-10">
          <SearchBar />
        </motion.div>
      </div>
    </section>
  );
}
