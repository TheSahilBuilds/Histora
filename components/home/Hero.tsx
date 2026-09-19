"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative flex min-h-[88vh] items-center overflow-hidden">
      <Image
        src="/images/history.jpg"
        alt=""
        aria-hidden="true"
        fill
        priority
        sizes="100vw"
        className="pointer-events-none object-cover object-[50%_35%] md:object-[50%_42%] lg:object-center"
      />
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(20,14,9,0.82) 0%, rgba(20,14,9,0.5) 38%, rgba(20,14,9,0.24) 66%, rgba(20,14,9,0.08) 100%), linear-gradient(180deg, rgba(20,14,9,0.3) 0%, rgba(20,14,9,0.06) 40%, rgba(20,14,9,0.4) 100%)",
        }}
      />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:px-6">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 text-[0.66rem] font-semibold uppercase tracking-[0.34em] text-bronze"
        >
          <Compass className="h-4 w-4" strokeWidth={1.5} />
          An interactive historical atlas
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display mt-5 max-w-4xl text-5xl font-semibold leading-[1.02] text-paper sm:text-6xl lg:text-7xl"
        >
          History, as it was lived.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display mt-5 max-w-2xl text-xl italic text-paper/85 sm:text-2xl"
        >
          Not rulers alone, but the fort, the field and the street — the places
          where a country&apos;s history was actually experienced.
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-5 max-w-xl text-sm leading-relaxed text-paper/65 sm:text-base"
        >
          Histora lets you wander an atlas of lived history — region by region, era
          by era — through maps, timelines, personal perspectives and the evidence
          behind every claim.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="mt-10 flex flex-col gap-4 sm:flex-row"
        >
          <Link
            href="/explore"
            className="btn-archive justify-center bg-bronze text-ink-dark hover:bg-bronze/90 sm:text-[0.78rem]"
          >
            Explore History
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          </Link>
          <Link
            href="/live"
            className="btn-archive justify-center border-paper/40 bg-transparent text-paper hover:bg-paper/10 sm:text-[0.78rem]"
          >
            <Sparkles className="h-4 w-4" strokeWidth={1.5} />
            Live Through History
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.55 }}
          className="mt-14 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.66rem] uppercase tracking-[0.22em] text-paper/45"
        >
          <span>People</span>
          <span className="text-bronze">·</span>
          <span>Places</span>
          <span className="text-bronze">·</span>
          <span>Events</span>
          <span className="text-bronze">·</span>
          <span>Perspectives</span>
          <span className="text-bronze">·</span>
          <span>Evidence</span>
        </motion.div>
      </div>
    </section>
  );
}