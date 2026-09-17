"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, Landmark } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Map", href: "/map" },
  { label: "Timeline", href: "/timeline" },
  { label: "Perspectives", href: "/perspectives" },
  { label: "Sources", href: "/sources" },
  { label: "Guide", href: "/guide" },
];

export default function Navigation() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-all duration-300",
        scrolled || open
          ? "border-ink-soft/25 bg-paper/90 shadow-paper backdrop-blur"
          : "border-transparent bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center border border-bronze/60 text-bronze transition-colors group-hover:bg-bronze/10">
            <Landmark className="h-4.5 w-4.5" strokeWidth={1.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold tracking-wide text-ink">
              Histora
            </span>
            <span className="text-[0.52rem] uppercase tracking-[0.3em] text-ink-muted">
              History from below
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "relative px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors",
                isActive(link.href)
                  ? "text-bronze"
                  : "text-ink-muted hover:text-ink"
              )}
            >
              {link.label}
              {isActive(link.href) ? (
                <span className="absolute inset-x-3 bottom-0 h-px bg-bronze" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/live"
            className="btn-archive hidden md:inline-flex text-[0.66rem]"
          >
            Live Through History
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="flex h-10 w-10 items-center justify-center border border-ink-soft/40 text-ink lg:hidden"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.5} /> : <Menu className="h-5 w-5" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open ? (
        <nav
          className="border-t border-ink-soft/20 bg-paper/95 px-4 pb-6 pt-2 backdrop-blur lg:hidden"
          aria-label="Mobile"
        >
          <div className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "border-b border-ink-soft/10 py-3 text-sm font-medium uppercase tracking-[0.16em]",
                  isActive(link.href) ? "text-bronze" : "text-ink-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/live"
              onClick={() => setOpen(false)}
              className="btn-archive mt-4 justify-center text-[0.7rem]"
            >
              Live Through History
            </Link>
          </div>
        </nav>
      ) : null}
    </header>
  );
}