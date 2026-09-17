"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";

function MapArt() {
  return (
    <svg
      viewBox="0 0 800 500"
      className="pointer-events-none absolute inset-0 h-full w-full text-bronze"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g opacity="0.16">
        <path
          d="M40 420 q120 -40 180 20 q70 60 140 -10 q60 -60 100 10 q50 80 130 10 q60 -50 70 50"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
        <path
          d="M60 80 q160 30 220 -10 q70 -50 140 0 q80 60 180 -20 q60 -50 90 0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="2 6"
        />
        <circle cx="540" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.8" />
        <circle cx="540" cy="200" r="108" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="540" cy="200" r="66" fill="none" stroke="currentColor" strokeWidth="0.6" />
        <path
          d="M540 200 m-12 0 a12 12 0 1 0 24 0 a12 12 0 1 0 -24 0"
          fill="currentColor"
        />
        <path
          d="M540 120 L548 196 L624 200 L548 204 L540 280 L532 204 L456 200 L532 196 Z"
          fill="currentColor"
        />
        <path
          d="M120 150 l-34 10 22 28 -28 -8 -8 19 0 -25 z"
          fill="currentColor"
          opacity="0.8"
        />
        <path
          d="M680 90 q40 20 20 60"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <circle cx="700" cy="130" r="3" fill="currentColor" />
        <circle cx="680" cy="90" r="3" fill="currentColor" />
        <text x="700" y="120" fontSize="10" fill="currentColor" fontStyle="italic">
          the sahyadri
        </text>
        <text x="150" y="160" fontSize="9" fill="currentColor" fontStyle="italic">
          shivneri
        </text>
        <text x="470" y="405" fontSize="10" fill="currentColor" fontStyle="italic">
          swarajya
        </text>
      </g>
    </svg>
  );
}

export default function Hero() {
  return (
    <section className="parchment-deep relative flex min-h-[88vh] items-center overflow-hidden">
      <MapArt />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 20%, rgba(154,107,63,0.18), transparent 55%), radial-gradient(circle at 80% 80%, rgba(232,220,196,0.08), transparent 45%)",
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