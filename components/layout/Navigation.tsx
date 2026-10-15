"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Explore", href: "/explore" },
  { label: "Search", href: "/search" },
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
        "fixed inset-x-0 top-0 z-40 border-b border-ink-soft/25 bg-paper/95 shadow-paper backdrop-blur transition-shadow duration-300",
        scrolled && "shadow-paper-lg"
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="group flex shrink-0 items-center">
          <Image
            src="/images/histora-logo.png"
            alt="Histora"
            width={2172}
            height={724}
            priority
            sizes="(max-width: 639px) 108px, 120px"
            className="h-9 w-auto transition-opacity group-hover:opacity-90 sm:h-10"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={cn(
                "focus-ring relative rounded-sm px-3 py-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] transition-colors",
                isActive(link.href)
                  ? "text-bronze"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {link.label}
              {isActive(link.href) ? (
                <span className="absolute inset-x-3 bottom-0 h-0.5 bg-bronze" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={open}
            className="focus-ring flex h-10 w-10 items-center justify-center border border-ink-soft/50 text-ink lg:hidden"
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
                aria-current={isActive(link.href) ? "page" : undefined}
                className={cn(
                  "focus-ring border-b border-ink-soft/10 py-3 text-sm font-medium uppercase tracking-[0.16em]",
                  isActive(link.href) ? "text-bronze" : "text-ink-soft hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      ) : null}
    </header>
  );
}