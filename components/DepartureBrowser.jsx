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
            <span className={`whitespace-nowrap text-xs font-semibold ${sold ? "text-muted" : "text-heirloom"}`}>
              {sold ? "Sold out" : badge ? badge.text : `${d.availableSeats} of ${d.totalSeats} seats left`}
            </span>
          </div>
          {/* fill = seats already booked */}
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-mint">
            <div className={`h-full rounded-full transition-all ${sold ? "bg-muted/40" : d.availableSeats <= 3 ? "bg-red-500" : badge ? "bg-amber-500" : "bg-brand"}`}
              style={{ width: `${d.totalSeats ? Math.min(100, ((d.totalSeats - d.availableSeats) / d.totalSeats) * 100) : 0}%` }} />
          </div>
          {/* Book Now = the trip's own page (booking form lives there); WhatsApp = book with us in chat. */}
          <div className="mt-4 grid grid-cols-[auto_minmax(0,1fr)] gap-2">
            {sold ? (
              <span aria-disabled="true" className={`${btn} col-span-2 cursor-not-allowed bg-line text-muted`}>Sold out</span>
            ) : (
              <a href={d.url} target="_blank" rel="noopener noreferrer" className={`${btn} col-span-2 bg-heirloom text-white hover:brightness-110`}>
                Book Now <Icon name="arrow" />
              </a>
            )}
            <a href={d.url} target="_blank" rel="noopener noreferrer" className={`${btn} border border-ink/80 px-5 text-ink hover:bg-mint`}>
              Details <Icon name="arrow" />
            </a>
            {sold ? (
              <span aria-disabled="true" className={`${btn} cursor-not-allowed whitespace-nowrap bg-line text-muted`}><Icon name="chat" /> Book via WhatsApp</span>
            ) : (
              <a href={whatsappLink(`Hi Encamp, I want to book "${d.title}" departing ${fmt(d.date, { day: "numeric", month: "long", year: "numeric" })}.`)}
                target="_blank" rel="noopener noreferrer" className={`${btn} whitespace-nowrap bg-ink text-white hover:bg-brand-dark`}>
                <Icon name="chat" /> Book via WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}


const SORTS = {
  date: ["Soonest first", null], // data already arrives sorted by date, then title
  price: ["Lowest price", (a, b) => (a.price ?? Infinity) - (b.price ?? Infinity)],
  days: ["Shortest trip", (a, b) => a.days - b.days],
};
const PAGE = 12;
const plural = (n, w) => `${n} ${w}${n === 1 ? "" : "s"}`;
const monthName = (m, opts = { month: "long", year: "numeric" }) => fmt(`${m}-01`, opts);

function Step({ n, title, hint, children }) {
  return (
    <div className="rounded-3xl border border-line bg-white/90 p-4 shadow-lg shadow-ink/5 backdrop-blur sm:p-5">
      <div className="flex items-start gap-3">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-heirloom text-sm font-extrabold text-white">{n}</span>
        <div>
          <h3 className="text-lg font-bold leading-tight text-ink">{title}</h3>
          <p className="text-sm text-muted">{hint}</p>
        </div>
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

const tile = (on, empty) =>
  `flex flex-col items-center justify-center rounded-2xl border px-2 py-2.5 text-center transition ${
    on ? "border-heirloom bg-heirloom text-white shadow-lg" : empty ? "border-dashed border-line bg-white/60 text-muted hover:border-brand" : "border-line bg-white text-ink hover:border-brand hover:bg-mint"
  }`;

export default function DepartureBrowser({ departures, children }) {
  // Festival / limited-edition departures, one card per label.
  const specials = useMemo(
    () => [...Map.groupBy(departures.filter((d) => d.label.trim()), (d) => d.label.trim())].map(([label, [d]]) => ({ label, d })),
    [departures]
  );
  const months = useMemo(() => [...new Set(departures.map((d) => d.date.slice(0, 7)))], [departures]);
  // Busiest destinations first; thumbnail from its first departure.
  const places = useMemo(
    () => [...Map.groupBy(departures, (d) => d.state)]
      .map(([name, ds]) => ({ name, image: ds[0].image, total: ds.length }))
      .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name)),
    [departures]
  );

  const [month, setMonthRaw] = useState(months[0] ?? ""); // "" = any month
  const [place, setPlaceRaw] = useState(""); // "" = anywhere
  const [sort, setSort] = useState("date");
  const [limit, setLimit] = useState(PAGE);
  const listRef = useRef(null);
  const setMonth = (m) => { setMonthRaw(m); setLimit(PAGE); };
  const setPlace = (p) => { setPlaceRaw(p); setLimit(PAGE); };

  const inMonth = (d) => !month || d.date.startsWith(month);
  const atPlace = (d) => !place || d.state === place;
  const monthCount = (m) => departures.filter((d) => (!m || d.date.startsWith(m)) && atPlace(d)).length;
  const placeCount = (p) => departures.filter((d) => (!p || d.state === p) && inMonth(d)).length;

  const results = departures.filter((d) => inMonth(d) && atPlace(d)).toSorted(SORTS[sort][1] ?? undefined);
  const shown = results.slice(0, limit);
  const summary = `${plural(results.length, "trip")}${place ? ` to ${place}` : ""}${month ? ` in ${monthName(month)}` : ""}`;
  // When a place has nothing in the chosen month, point to the months it does have.
  const placeMonths = place ? months.filter((m) => departures.some((d) => d.state === place && d.date.startsWith(m))) : [];

  const toList = () => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <>
      <section id="departures" className="relative overflow-hidden bg-paper">
        <Image src="/images/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover object-bottom" />
        <div className="relative mx-auto max-w-7xl px-4 pt-10 md:pt-14">
          {children}

          {departures.length ? (
            <div className="mt-10 pb-10">
              <h2 className="text-2xl font-extrabold text-ink md:text-3xl">Find your group trip</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted md:text-base">
                Every trip below leaves on a fixed date with a small group. Choose when you&apos;re free and where you&apos;d like to go, and we&apos;ll show you every group that matches.
              </p>

              <div className="mt-5 grid gap-4">
                <Step n="1" title="When are you free?" hint="Pick a month. The number shows how many trips leave that month.">
                  <div role="group" aria-label="Month" className="grid grid-cols-3 gap-2 min-[420px]:grid-cols-5 lg:grid-cols-10">
                    <button type="button" onClick={() => setMonth("")} aria-pressed={!month} className={tile(!month)}>
                      <span className="text-sm font-bold">Any month</span>
                      <span className={`mt-0.5 text-[11px] ${!month ? "text-white/85" : "text-muted"}`}>{plural(monthCount(""), "trip")}</span>
                    </button>
                    {months.map((m) => {
                      const n = monthCount(m);
                      const on = m === month;
                      return (
                        <button key={m} type="button" onClick={() => setMonth(m)} aria-pressed={on} className={tile(on, !n)}>
                          <span className={`text-[10px] font-semibold uppercase tracking-wider ${on ? "text-white/75" : "text-muted"}`}>{m.slice(0, 4)}</span>
                          <span className="text-base font-extrabold leading-tight">{monthName(m, { month: "short" })}</span>
                          <span className={`mt-0.5 text-[11px] ${on ? "text-white/85" : "text-muted"}`}>{n ? plural(n, "trip") : "None"}</span>
                        </button>
                      );
                    })}
                  </div>
                </Step>

                <Step n="2" title="Where do you want to go?"
                  hint={month ? `Places with trips in ${monthName(month, { month: "long" })} are shown in colour. Faded ones have none that month.` : "Pick a place, or keep Anywhere to see them all."}>
                  <div role="group" aria-label="Destination" className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                    <button type="button" onClick={() => setPlace("")} aria-pressed={!place}
                      className={`flex aspect-square flex-col items-center justify-center gap-1 rounded-2xl border text-center transition ${!place ? "border-heirloom bg-heirloom text-white shadow-lg" : "border-line bg-mint text-ink hover:border-brand"}`}>
                      <Icon name="pin" className="h-6 w-6" />
                      <span className="text-sm font-bold">Anywhere</span>
                      <span className={`text-[11px] ${!place ? "text-white/85" : "text-muted"}`}>{plural(placeCount(""), "trip")}</span>
                    </button>
                    {places.map(({ name, image }) => {
                      const n = placeCount(name);
                      const on = name === place;
                      return (
                        <button key={name} type="button" onClick={() => setPlace(name)} aria-pressed={on}
                          aria-label={`${name}, ${n ? plural(n, "trip") : "no trips"}${month ? ` in ${monthName(month, { month: "long" })}` : ""}`}
                          className={`group relative aspect-square overflow-hidden rounded-2xl text-left transition ${on ? "ring-4 ring-heirloom ring-offset-2" : "hover:-translate-y-0.5 hover:shadow-lg"}`}>
                          <Image src={image} alt="" fill sizes="(min-width:1024px) 150px, (min-width:640px) 25vw, 33vw"
                            className={`object-cover transition duration-500 group-hover:scale-110 ${n ? "" : "opacity-60 grayscale"}`} />
                          <span className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                          {on && <span className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-heirloom text-white shadow"><Icon name="check" className="h-4 w-4" /></span>}
                          <span className="absolute inset-x-0 bottom-0 p-2 text-white">
                            <span className="block text-sm font-bold leading-tight">{name}</span>
                            <span className="block text-[11px] text-white/80">{n ? plural(n, "trip") : "None this month"}</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </Step>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-tomato p-3 pl-5 text-white shadow-lg shadow-tomato/25">
                <p className="min-w-0 flex-1 text-sm sm:text-base">
                  <span className="text-white/85">You&apos;ll see </span><span className="font-bold">{summary}</span>
                </p>
                {(month || place) && (
                  <button type="button" onClick={() => { setMonth(""); setPlace(""); }} className="rounded-full px-3 py-2 text-sm font-semibold text-white/85 transition hover:text-white">
                    Clear choices
                  </button>
                )}
                <button type="button" onClick={toList} disabled={!results.length}
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-tomato transition hover:bg-white/90 disabled:opacity-40">
                  Show trips <Icon name="arrow" className="h-4 w-4 rotate-90" />
                </button>
              </div>
            </div>
          ) : (
            <p className="py-16 text-lg font-bold text-ink">New departures are being planned. Check back soon.</p>
          )}
        </div>
      </section>

      {departures.length > 0 && (
        <section ref={listRef} aria-live="polite" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-10">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-ink sm:text-2xl">{summary}</h2>
              <p className="mt-1 max-w-xl text-sm text-muted">
                Tap <b className="text-ink">Book Now</b> to book on the trip&apos;s page, <b className="text-ink">Details</b> to see the full plan, or <b className="text-ink">Book via WhatsApp</b> to reserve your place with us in chat.
              </p>
            </div>
            {results.length > 1 && (
              <div role="group" aria-label="Sort trips" className="flex max-w-full items-center gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 [scrollbar-width:none]">
                <span className="shrink-0 px-2 text-xs text-muted">Sort:</span>
                {Object.entries(SORTS).map(([key, [label]]) => (
                  <button key={key} type="button" onClick={() => setSort(key)} aria-pressed={sort === key}
                    className={`shrink-0 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${sort === key ? "bg-ink text-white shadow" : "text-muted hover:bg-mint hover:text-ink"}`}>
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {results.length ? (
            <>
              {/* Date order: group under a heading per departure day. Other sorts: one flat list (each card shows its dates). */}
              {sort === "date" ? (
                [...Map.groupBy(shown, (d) => d.date)].map(([ymd, ds]) => (
                  <div key={ymd} className="mb-6">
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-ink">
                      <Icon name="calendar" className="h-4 w-4 text-brand-dark" />
                      {/* weekday joined by hand: Node and browsers disagree on the comma for en-IN */}
                      Leaving {fmt(ymd, { weekday: "long" })}, {fmt(ymd, { day: "numeric", month: "long" })}
                      <span className="font-medium text-muted">· {plural(ds.length, "group")}</span>
                    </h3>
                    <div className="grid gap-4">{ds.map((d) => <DepartureCard key={d.key} d={d} />)}</div>
                  </div>
                ))
              ) : (
                <div className="grid gap-4">{shown.map((d) => <DepartureCard key={d.key} d={d} />)}</div>
              )}
              {results.length > shown.length && (
                <button type="button" onClick={() => setLimit((n) => n + PAGE)}
                  className="mx-auto mt-2 flex items-center gap-2 rounded-full border border-ink/80 px-6 py-3 text-sm font-semibold text-ink transition hover:bg-mint">
                  Show {Math.min(PAGE, results.length - shown.length)} more
                  <span className="text-muted">({results.length - shown.length} left)</span>
                </button>
              )}
            </>
          ) : (
            <div className="rounded-3xl border border-dashed border-line bg-white p-6 text-center sm:p-10">
              <p className="text-lg font-bold text-ink">No groups to {place} in {monthName(month, { month: "long" })} yet.</p>
              <p className="mt-1 text-sm text-muted">{place} has trips in these months. Pick one:</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                {placeMonths.map((m) => (
                  <button key={m} type="button" onClick={() => setMonth(m)} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition hover:border-brand hover:bg-mint">
                    {monthName(m)}
                  </button>
                ))}
              </div>
              <button type="button" onClick={() => setPlace("")} className="mt-4 text-sm font-semibold text-brand-dark hover:underline">
                Or see every place in {monthName(month, { month: "long" })}
              </button>
            </div>
          )}
        </section>
      )}

      {specials.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-4">
          <p className="font-script text-2xl text-coral -rotate-2 origin-left">Don&apos;t miss these</p>
          <h2 className="text-2xl font-extrabold text-ink md:text-3xl">Special departures</h2>
          <p className="mt-1 text-sm text-muted">One-off trips around festivals and events. Tap one to see its dates.</p>
          <div className="-mx-4 mt-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none]">
            {specials.map(({ label, d }) => (
              <button key={label} type="button"
                onClick={() => { setMonth(d.date.slice(0, 7)); setPlace(d.state); toList(); }}
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
