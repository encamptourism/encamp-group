"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Icon from "@/components/Icon";
import { whatsappLink } from "@/lib/site";

// API dates are plain YYYY-MM-DD; format in UTC so no timezone shifts the day.
const toDate = (ymd) => new Date(`${ymd}T00:00:00Z`);
const fmt = (ymd, opts) => toDate(ymd).toLocaleDateString("en-IN", { timeZone: "UTC", ...opts });
const addDays = (ymd, n) => new Date(toDate(ymd).getTime() + n * 864e5).toISOString().slice(0, 10);
const inr = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const DMY = { day: "numeric", month: "short", year: "numeric" };

function status(left, total) {
  if (left <= 0) return { text: "Sold out", cls: "bg-line text-muted" };
  if (left <= 3) return { text: "Only a few left", cls: "bg-amber-50 text-amber-600" };
  if (total > 0 && left / total < 0.3) return { text: "Filling fast", cls: "bg-amber-50 text-amber-600" };
  return null;
}

// Special-departure labels get one of a few colours, stable per label text.
const LABEL_COLORS = ["bg-brand-dark", "bg-coral", "bg-violet-500"];
const labelColor = (s) => LABEL_COLORS[[...s].reduce((n, c) => n + c.charCodeAt(0), 0) % LABEL_COLORS.length];

// Seats still open across every trip leaving that day.
const openSeats = (trips) => trips.reduce((n, d) => n + Math.max(0, d.availableSeats), 0);

// Live "departs in" clock. Starts empty so server and client HTML match, then ticks every second.
function Countdown({ ymd }) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const ms = new Date(`${ymd}T00:00:00+05:30`) - now; // departures are IST dates
  if (now === null || ms <= 0) return null;
  const s = Math.floor(ms / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return (
    <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-coral px-2.5 py-1 text-[11px] font-bold text-white shadow-lg">
      <Icon name="clock" className="h-3.5 w-3.5" />
      <span className="font-mono tabular-nums">
        {Math.floor(s / 86400)}d {pad(Math.floor(s / 3600) % 24)}:{pad(Math.floor(s / 60) % 60)}:{pad(s % 60)}
      </span>
    </span>
  );
}

const DIFFICULTY = { Easy: "bg-emerald-500", Adventure: "bg-amber-500", "High Adventure": "bg-red-500" };
const chip = "flex items-center gap-1.5 rounded-full bg-paper px-2.5 py-1 ring-1 ring-line";

function DepartureCard({ d }) {
  const sold = d.availableSeats <= 0;
  const badge = status(d.availableSeats, d.totalSeats);
  const end = addDays(d.date, Math.max(0, d.days - 1));
  const btn = "flex h-11 flex-1 items-center justify-center gap-2 rounded-full text-sm font-semibold transition";

  return (
    <article className="group flex flex-col overflow-hidden sm:flex-row rounded-3xl border border-line bg-white p-2 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-mint sm:aspect-auto sm:min-h-56 sm:w-72 sm:shrink-0 lg:w-96">
        <Image src={d.image} alt={d.title} fill sizes="(min-width:1024px) 384px, (min-width:640px) 288px, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />
        {!sold && <Countdown ymd={d.date} />}
        <span className="absolute bottom-3 left-3 flex items-center gap-1 rounded-full bg-ink/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-white backdrop-blur">
          <Icon name="pin" className="h-3 w-3" />{d.state}
        </span>
      </div>

      {/* Mobile: stacked. Tablet: photo | details. Desktop: photo | details | booking column. */}
      <div className="flex min-w-0 flex-1 flex-col p-3 pt-4 sm:p-5 lg:flex-row lg:items-center lg:gap-8">
        <div className="min-w-0 lg:flex-1">
          {d.label && <p className={`mb-1.5 w-fit rounded-full px-2.5 py-0.5 text-[11px] font-bold text-white ${labelColor(d.label)}`}>★ {d.label}</p>}
          <h3 className="line-clamp-2 text-lg font-bold leading-snug text-ink lg:text-xl">{d.title}</h3>
          {d.subtitle && <p className="mt-0.5 line-clamp-1 text-sm text-muted">{d.subtitle}</p>}

          {d.route.length > 1 && (
            <p className="mt-2.5 flex items-start gap-1.5 text-sm font-medium text-ink">
              <Icon name="route" className="mt-0.5 h-4 w-4 text-brand-dark" />
              <span className="line-clamp-2">
                {d.route.slice(0, 5).join(" → ")}
                {d.route.length > 5 && <span className="text-muted"> +{d.route.length - 5} more</span>}
              </span>
            </p>
          )}

          <ul className="mt-3 flex flex-wrap gap-1.5 text-xs font-medium text-ink">
            {d.difficulty && <li className={chip}><span className={`h-2 w-2 rounded-full ${DIFFICULTY[d.difficulty] ?? "bg-muted"}`} />{d.difficulty}</li>}
            {d.tripType && <li className={chip}><Icon name="mountain" className="h-3.5 w-3.5 text-brand-dark" />{d.tripType}</li>}
            <li className={chip}><Icon name="clock" className="h-3.5 w-3.5 text-brand-dark" />{d.days}D / {d.nights}N</li>
            <li className={chip}><Icon name="calendar" className="h-3.5 w-3.5 text-brand-dark" />{fmt(d.date, { day: "numeric", month: "short" })}{end !== d.date && ` – ${fmt(end, DMY)}`}</li>
            {d.groupSize && <li className={chip}><Icon name="users" className="h-3.5 w-3.5 text-brand-dark" />{d.groupSize}</li>}
          </ul>

          {d.offer && (
            <p className="mt-3 flex w-fit items-center gap-2 rounded-lg border border-dashed border-coral/60 bg-coral/5 px-3 py-1.5 text-xs font-bold text-coral">
              <Icon name="tag" className="h-4 w-4" />{d.offer}
            </p>
          )}

          {/* Peek at the trip's gallery; the full set lives on the details page. */}
          {d.photos.length > 1 && (
            <a href={d.url} target="_blank" rel="noopener noreferrer" className="mt-3 hidden w-fit gap-1.5 sm:flex" aria-label={`See all ${d.photos.length} photos of ${d.title}`}>
              {d.photos.slice(1, 4).map((src, k) => (
                <span key={src} className="relative h-11 w-14 overflow-hidden rounded-lg bg-mint">
                  <Image src={src} alt="" fill sizes="56px" className="object-cover" />
                  {k === 2 && d.photos.length > 4 && (
                    <span className="absolute inset-0 flex items-center justify-center bg-ink/60 text-xs font-bold text-white">+{d.photos.length - 4}</span>
                  )}
                </span>
              ))}
            </a>
          )}
        </div>

        <div className="mt-auto pt-4 lg:mt-0 lg:w-80 lg:shrink-0 lg:self-stretch lg:border-l lg:border-line lg:pl-8 lg:pt-0 lg:flex lg:flex-col lg:justify-center">
          <div className="flex items-end justify-between gap-2">
            {d.price ? (
              <div>
                <div className="text-[11px] font-medium text-muted">Starting from</div>
                <div className="text-2xl font-extrabold leading-none text-ink">{inr(d.price)}<span className="ml-1 text-xs font-medium text-muted">/person</span></div>
              </div>
            ) : <span />}
            <span className={`whitespace-nowrap text-xs font-semibold ${sold ? "text-muted" : d.availableSeats <= 3 ? "text-red-600" : "text-brand-dark"}`}>
              {sold ? "Sold out" : badge ? badge.text : `${d.availableSeats} of ${d.totalSeats} seats left`}
            </span>
          </div>
          {/* fill = seats already booked */}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mint">
            <div className={`h-full rounded-full transition-all ${sold ? "bg-muted/40" : d.availableSeats <= 3 ? "bg-red-500" : badge ? "bg-amber-500" : "bg-brand"}`}
              style={{ width: `${d.totalSeats ? Math.min(100, ((d.totalSeats - d.availableSeats) / d.totalSeats) * 100) : 0}%` }} />
          </div>
          <div className="mt-4 flex gap-2">
            <a href={d.url} target="_blank" rel="noopener noreferrer" className={`${btn} border border-ink/80 text-ink hover:bg-mint`}>
              Details <Icon name="arrow" />
            </a>
            {sold ? (
              <span aria-disabled="true" className={`${btn} cursor-not-allowed bg-line text-muted`}><Icon name="chat" /> Book seat</span>
            ) : (
              <a href={whatsappLink(`Hi Encamp, I want to book "${d.title}" departing ${fmt(d.date, { day: "numeric", month: "long", year: "numeric" })}.`)}
                target="_blank" rel="noopener noreferrer" className={`${btn} bg-ink text-white hover:bg-brand-dark`}>
                <Icon name="chat" /> Book seat
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

const STEP = 52; // px between peaks
const PAD = STEP; // room so the first and last peaks aren't clipped
const MIN_H = 34;
const MAX_H = 150;
const LABEL_H = 44; // date row under the peaks
const TOP = 58; // headroom for the flag and month labels
const peakH = (n, max) => MIN_H + (MAX_H - MIN_H) * (max > 1 ? (n - 1) / (max - 1) : 1);

function Ridge({ days, selected, onSelect }) {
  const scroller = useRef(null);
  const max = Math.max(...days.map((d) => d.trips.length));

  // Centre the flagged peak whenever it moves (tap, month chip, special, filter).
  useEffect(() => {
    const el = scroller.current;
    const i = days.findIndex((d) => d.ymd === selected);
    if (el && i >= 0) el.scrollTo({ left: PAD + i * STEP + STEP / 2 - el.clientWidth / 2, behavior: "smooth" });
  }, [selected, days]);

  // First visit only: once the range has risen, nudge it sideways (it scrolls) and pulse a
  // nearby summit (it's tappable). No instructions; the hints vanish after the first tap.
  const [hint, setHint] = useState(false);
  useEffect(() => {
    try { if (localStorage.getItem("ridge-seen")) return; } catch { return; }
    const t = setTimeout(() => {
      setHint(true);
      scroller.current?.scrollBy({ left: 110, behavior: "smooth" });
      setTimeout(() => scroller.current?.scrollBy({ left: -110, behavior: "smooth" }), 650);
    }, 1300);
    return () => clearTimeout(t);
  }, []);
  const at = days.findIndex((d) => d.ymd === selected);
  const lure = hint && days.slice(Math.max(0, at - 3), at + 4).filter((d) => d.ymd !== selected)
    .reduce((a, b) => (b.trips.length > (a?.trips.length ?? 0) ? b : a), null)?.ymd;
  const choose = (ymd) => {
    onSelect(ymd);
    if (!hint) return;
    setHint(false);
    try { localStorage.setItem("ridge-seen", "1"); } catch {}
  };

  return (
    <div className="relative">
      {/* axis cue, pinned while the range scrolls under it */}
      <span aria-hidden="true" className="pointer-events-none absolute left-1 z-10 flex flex-col items-center gap-1 text-ink/40" style={{ bottom: LABEL_H + 6 }}>
        <span className="text-[8px]">▲</span>
        <span className="rotate-180 text-[9px] font-bold uppercase tracking-widest [writing-mode:vertical-rl]">more trips</span>
      </span>
      <div ref={scroller} className="overflow-x-auto [scrollbar-width:none] [mask-image:linear-gradient(to_right,transparent,#000_28px,#000_calc(100%-28px),transparent)]">
        <div className="relative" style={{ width: days.length * STEP + 2 * PAD, height: TOP + MAX_H + LABEL_H }}>
          {days.map(({ ymd, trips, special }, i) => {
            const x = PAD + i * STEP + STEP / 2;
            const h = peakH(trips.length, max);
            const active = ymd === selected;
            const newMonth = i === 0 || days[i - 1].ymd.slice(0, 7) !== ymd.slice(0, 7);
            const pick = () => choose(ymd);
            return (
              // display:contents keeps positioning on the ridge but scopes the peer-hover links to this day
              <div key={ymd} className="contents">
                {newMonth && (
                  <div className="pointer-events-none absolute top-0 border-l border-dashed border-ink/25" style={{ left: x - STEP / 2, bottom: LABEL_H }}>
                    <span className="ml-1.5 text-[11px] font-extrabold uppercase tracking-widest text-ink/60">{fmt(ymd, { month: "short" })}</span>
                  </div>
                )}

                {/* The peak itself. clip-path also clips hit-testing, so overlapping peaks click correctly. */}
                <div aria-hidden="true" onClick={pick}
                  className={`peer absolute origin-bottom cursor-pointer animate-rise transition-[height,filter] duration-500 hover:brightness-125 [clip-path:polygon(50%_0,100%_100%,0_100%)]`}
                  style={{
                    left: x - STEP * 1.15, width: STEP * 2.3, height: h, bottom: LABEL_H,
                    zIndex: active ? 200 : Math.round(MAX_H - h),
                    animationDelay: `${Math.min(i, 30) * 25}ms`,
                    background: [
                      h > MAX_H * 0.55 && "linear-gradient(#f6faf8 0 20px, transparent 20px)", // snow cap on the big days
                      "linear-gradient(to right, #ffffff1f 50%, transparent 50%)", // sunlit face
                      active ? "linear-gradient(#34cc9c, #0e6e55)" : "linear-gradient(#0e6e55, #053b2c)",
                    ].filter(Boolean).join(","),
                  }} />

                {active ? (
                  // Summit flag with the trip count on it.
                  <div className="pointer-events-none absolute z-[300] animate-plant" style={{ left: x - 1, bottom: LABEL_H + h - 2 }}>
                    <div className="h-11 w-0.5 bg-ink" />
                    <div className="absolute left-0.5 top-0 origin-left animate-wave whitespace-nowrap rounded-r-md bg-coral px-2 py-0.5 text-[11px] font-bold text-white shadow-lg">
                      {trips.length} trip{trips.length > 1 ? "s" : ""}
                    </div>
                  </div>
                ) : (
                  <span className="pointer-events-none absolute z-[250] -translate-x-1/2 text-[10px] font-bold text-ink/70 transition peer-hover:-translate-y-1 peer-hover:scale-150 peer-hover:text-coral" style={{ left: x, bottom: LABEL_H + h + 3 }}>
                    {special ? <span className="text-amber-500">★</span> : null}{trips.length}
                  </span>
                )}

                {ymd === lure && (
                  <span aria-hidden="true" className="pointer-events-none absolute z-[260] flex h-4 w-4 -translate-x-1/2" style={{ left: x, bottom: LABEL_H + h - 22 }}>
                    <span className="absolute h-full w-full animate-ping rounded-full bg-white" />
                    <span className="relative m-1 h-2 w-2 rounded-full bg-white shadow" />
                  </span>
                )}

                <button type="button" onClick={pick} aria-pressed={active}
                  aria-label={`${fmt(ymd, { weekday: "long", day: "numeric", month: "long" })}, ${trips.length} trip${trips.length > 1 ? "s" : ""}`}
                  className={`absolute bottom-0 flex flex-col items-center justify-center rounded-lg leading-none transition ${active ? "bg-ink text-white shadow-lg" : "text-ink hover:bg-mint peer-hover:bg-mint"}`}
                  style={{ left: x - STEP / 2 + 3, width: STEP - 6, height: LABEL_H - 4 }}>
                  <span className={`text-[9px] font-semibold uppercase ${active ? "text-brand" : "text-muted"}`}>{fmt(ymd, { weekday: "short" })}</span>
                  <span className="mt-1 text-base font-extrabold">{Number(ymd.slice(8))}</span>
                </button>
              </div>
            );
          })}
          <div className="pointer-events-none absolute inset-x-0 border-t-2 border-ink/80" style={{ bottom: LABEL_H }} />
        </div>
      </div>
    </div>
  );
}

const SORTS = {
  name: ["A–Z", null], // data already arrives sorted by date, then title
  price: ["Lowest price", (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)],
  seats: ["Most seats", (a, b) => b.availableSeats - a.availableSeats],
  days: ["Shortest", (a, b) => a.days - b.days],
};

export default function DepartureBrowser({ departures, children }) {
  // One row per destination: thumbnail from its first departure, count of distinct trips.
  const states = useMemo(
    () => [...Map.groupBy(departures, (d) => d.state)]
      .map(([name, ds]) => ({ name, image: ds[0].image, trips: new Set(ds.map((d) => d.id)).size }))
      .sort((a, b) => b.trips - a.trips || a.name.localeCompare(b.name)),
    [departures]
  );
  // Festival / limited-edition departures, one card per label.
  const specials = useMemo(
    () => [...Map.groupBy(departures.filter((d) => d.label.trim()), (d) => d.label.trim())].map(([label, [d]]) => ({ label, d })),
    [departures]
  );
  const [picked, setPicked] = useState(null);
  const [chosen, setChosen] = useState([]); // empty = all destinations
  const [sort, setSort] = useState("name");
  const listRef = useRef(null);

  const days = useMemo(
    () => [...Map.groupBy(departures.filter((d) => !chosen.length || chosen.includes(d.state)), (d) => d.date)]
      .map(([ymd, trips]) => ({ ymd, trips, special: trips.some((d) => d.label.trim()) })),
    [departures, chosen]
  );
  const months = [...Map.groupBy(days, (d) => d.ymd.slice(0, 7))];

  const day = days.find((d) => d.ymd === picked) ?? days[0];
  const selected = day?.ymd;
  const trips = day ? day.trips.toSorted(SORTS[sort][1] ?? undefined) : [];
  const i = days.indexOf(day);

  const toList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const toggle = (s) => setChosen((c) => (c.includes(s) ? c.filter((x) => x !== s) : [...c, s]));
  const nav = "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white text-ink transition hover:bg-mint disabled:opacity-30";

  return (
    <>
      <section id="departures" className="relative overflow-hidden bg-paper">
        <Image src="/images/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-bottom" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 md:pt-14">
          {children}

          {day ? (
            <div className="mt-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-extrabold text-ink md:text-3xl">Pick your peak</h2>
                  <p className="text-sm text-muted">The busier the day, the higher the peak. Plant your flag.</p>
                </div>
                {/* Month shortcuts */}
                <div className="flex flex-wrap gap-1.5">
                  {months.map(([m, ds]) => {
                    const on = selected.startsWith(m);
                    return (
                      <button key={m} type="button" onClick={() => setPicked(ds[0].ymd)} aria-pressed={on}
                        className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${on ? "border-ink bg-ink text-white" : "border-line bg-white/80 text-ink hover:bg-mint"}`}>
                        {fmt(`${m}-01`, { month: "short" })}
                        <span className={`ml-1.5 ${on ? "text-brand" : "text-muted"}`}>{ds.reduce((n, d) => n + d.trips.length, 0)}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="-mx-4 mt-2 md:mx-0">
                <Ridge days={days} selected={selected} onSelect={setPicked} />
              </div>

              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white/90 p-3 shadow-lg shadow-ink/5 backdrop-blur">
                <button type="button" className={nav} disabled={i <= 0} onClick={() => setPicked(days[i - 1].ymd)} aria-label="Previous date"><Icon name="left" /></button>
                <div className="min-w-0 flex-1 text-center sm:text-left">
                  <div className="truncate text-sm font-bold text-ink sm:text-base">{fmt(selected, { weekday: "long", day: "numeric", month: "long" })}</div>
                  <div className="text-xs text-muted">
                    <span className="font-semibold text-brand-dark">{trips.length} trip{trips.length > 1 ? "s" : ""}</span> · {openSeats(trips)} seats open
                  </div>
                </div>
                <button type="button" onClick={toList} className="hidden items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-dark sm:flex">
                  See trips <Icon name="arrow" className="h-4 w-4 rotate-90" />
                </button>
                <button type="button" className={nav} disabled={i >= days.length - 1} onClick={() => setPicked(days[i + 1].ymd)} aria-label="Next date"><Icon name="right" /></button>
              </div>

              {/* Destination filter reshapes the range */}
              <div className="mt-4 flex flex-wrap gap-2 pb-8">
                {states.map(({ name, image, trips: n }) => (
                  <label key={name} className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line bg-white/90 py-1 pl-1 pr-3 transition hover:border-brand has-checked:border-brand-dark has-checked:bg-mint">
                    <input type="checkbox" checked={chosen.includes(name)} onChange={() => toggle(name)} className="sr-only" />
                    <span className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-mint">
                      <Image src={image} alt="" fill sizes="28px" className="object-cover" />
                    </span>
                    <span className="whitespace-nowrap text-sm font-medium text-ink">{name}</span>
                    <span className="rounded-full bg-line/70 px-2 py-0.5 text-[11px] text-muted group-has-checked:bg-brand group-has-checked:font-semibold group-has-checked:text-ink">{n}</span>
                  </label>
                ))}
                {chosen.length > 0 && (
                  <button type="button" onClick={() => setChosen([])} className="shrink-0 px-2 text-sm font-semibold text-coral hover:underline">Clear</button>
                )}
              </div>
            </div>
          ) : (
            <p className="py-16 text-lg font-bold text-ink">New departures are being planned. Check back soon.</p>
          )}
        </div>
      </section>

      {day && (
        <section ref={listRef} aria-live="polite" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex w-16 shrink-0 flex-col items-center rounded-2xl bg-ink py-2 text-white shadow-lg shadow-ink/20">
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand">{fmt(selected, { weekday: "short" })}</span>
                <span className="text-2xl font-extrabold leading-tight">{fmt(selected, { day: "numeric" })}</span>
                <span className="text-[10px] font-semibold uppercase text-white/70">{fmt(selected, { month: "short" })}</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-ink sm:text-2xl">Trips leaving {fmt(selected, { day: "numeric", month: "long" })}</h2>
                <p className="text-sm text-muted"><span className="font-semibold text-brand-dark">{trips.length} group{trips.length > 1 ? "s" : ""}</span> heading out this day</p>
              </div>
            </div>
            {trips.length > 1 && (
              <div role="group" aria-label="Sort trips" className="-mx-1 flex max-w-full gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 [scrollbar-width:none]">
                {Object.entries(SORTS).map(([key, [label]]) => (
                  <button key={key} type="button" onClick={() => setSort(key)} aria-pressed={sort === key}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${sort === key ? "bg-ink text-white shadow" : "text-muted hover:bg-mint hover:text-ink"}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {trips.map((d) => <DepartureCard key={d.key} d={d} />)}
          </div>
        </section>
      )}

      {specials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-4">
          <p className="font-script text-2xl text-coral -rotate-2 origin-left">Don&apos;t miss these</p>
          <h2 className="text-2xl font-extrabold text-ink md:text-3xl">Special departures</h2>
          <div className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
            {specials.map(({ label, d }) => (
              <button key={label} type="button"
                onClick={() => { setChosen([]); setPicked(d.date); toList(); }}
                className="group relative aspect-[3/4] w-56 shrink-0 snap-start overflow-hidden rounded-3xl text-left shadow-lg shadow-ink/10 sm:w-64">
                <Image src={d.image} alt="" fill sizes="256px" className="object-cover transition duration-500 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
                <span className="absolute left-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow">
                  {fmt(d.date, { day: "numeric", month: "short" })}
                </span>
                <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                  <span className="text-amber-300">★</span>
                  <p className="text-lg font-extrabold leading-tight">{label}</p>
                  <p className="mt-1 line-clamp-2 text-xs text-white/75">{d.title}</p>
                  <span className="mt-3 flex items-center gap-1.5 text-xs font-bold text-brand transition group-hover:gap-2.5">View dates <Icon name="arrow" className="h-3.5 w-3.5" /></span>
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </>
  );
}
