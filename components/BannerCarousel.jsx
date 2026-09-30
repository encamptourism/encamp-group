"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";

// Swipeable promo banners that auto-advance until the visitor touches them.
export default function BannerCarousel({ banners }) {
  const track = useRef(null);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = (n) => {
    const el = track.current;
    el?.scrollTo({ left: n * el.clientWidth, behavior: "smooth" });
  };

  useEffect(() => {
    if (paused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => go((i + 1) % banners.length), 4500);
    return () => clearInterval(t);
  }, [i, paused, banners.length]);

  return (
    <section aria-roledescription="carousel" aria-label="Offers" className="mx-auto max-w-7xl px-4 pt-8"
      onPointerDown={() => setPaused(true)} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div ref={track} onScroll={(e) => setI(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex snap-x snap-mandatory overflow-x-auto rounded-3xl shadow-xl shadow-ink/10 [scrollbar-width:none]">
        {banners.map((b, k) => (
          <a key={b.src} href={b.href} target={b.href.startsWith("#") ? undefined : "_blank"} rel="noopener noreferrer"
            aria-label={b.title || `Banner ${k + 1}`}
            className="group relative aspect-[16/10] w-full shrink-0 snap-center overflow-hidden sm:aspect-[21/8]">
            <Image src={b.src} alt="" fill sizes="(min-width:1280px) 1248px, 100vw" priority={k === 0}
              className={`object-cover transition duration-[6000ms] ease-out ${i === k ? "scale-110" : "scale-100"}`} />
            {/* Plain photos get a text overlay; finished artwork banners (no title) show as-is. */}
            {b.title && (
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-ink/40 to-transparent p-5 text-white sm:justify-center sm:bg-gradient-to-r sm:p-10">
                <span className={`w-fit rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-widest ${b.tagCls}`}>{b.tag}</span>
                <p className="mt-2 max-w-md text-2xl font-extrabold leading-tight sm:text-4xl">{b.title}</p>
                <p className="mt-1 max-w-sm text-sm text-white/80 sm:text-base">{b.sub}</p>
                <span className="mt-4 flex w-fit items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-ink shadow-lg transition group-hover:gap-3">
                  {b.cta} <Icon name="arrow" />
                </span>
              </div>
            )}
          </a>
        ))}
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {banners.map((b, k) => (
          <button key={b.src} type="button" onClick={() => { setPaused(true); go(k); }} aria-label={`Show banner ${k + 1}`} aria-current={i === k}
            className={`h-2 rounded-full transition-all ${i === k ? "w-6 bg-ink" : "w-2 bg-ink/20 hover:bg-ink/40"}`} />
        ))}
      </div>
    </section>
  );
}
