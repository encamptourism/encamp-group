import Image from "next/image";
import Icon from "@/components/Icon";
import DepartureBrowser from "@/components/DepartureBrowser";
import BannerCarousel from "@/components/BannerCarousel";
import { getDepartures } from "@/lib/departures";
import { PHONE, whatsappLink } from "@/lib/site";

export const revalidate = 300;

const day = (ymd, opts) => new Date(`${ymd}T00:00:00Z`).toLocaleDateString("en-IN", { timeZone: "UTC", ...opts });

const PERKS = [
  ["users", "Small Groups", "Like-minded travellers"],
  ["shield", "Safe & Trusted", "Experienced trip leaders"],
  ["mountain", "Real Experiences", "Nature, culture, local life"],
];

// Scrolling urgency strip; the list is rendered twice so the loop is seamless.
function SaleTicker({ items }) {
  const row = (hidden) => (
    <ul aria-hidden={hidden || undefined} className="flex shrink-0 items-center gap-8 pr-8">
      {items.map((t) => <li key={t} className="flex items-center gap-2 whitespace-nowrap">{t}<span className="text-brand">✦</span></li>)}
    </ul>
  );
  return (
    <div className="flex overflow-hidden bg-coral py-2 text-xs font-bold uppercase tracking-wider text-white sm:text-sm">
      <div className="flex animate-marquee motion-reduce:animate-none">{row(false)}{row(true)}</div>
    </div>
  );
}

export default async function Home() {
  const departures = await getDepartures();
  const trips = new Set(departures.map((d) => d.id)).size;
  const seats = departures.reduce((s, d) => s + Math.max(0, d.availableSeats), 0);
  const next = departures.find((d) => d.availableSeats > 0);

  const nextDay = next && day(next.date, { day: "numeric", month: "short" });
  const wa = (t) => whatsappLink(`Hi Encamp, ${t}`);
  // ponytail: photo stand-ins; swap in the marketing banners (no title = image shown as-is) when they land in /public/images/banners.
  const banners = [
    { src: "/images/groups/snow_trek_group.jpg", tag: "Sale is live", tagCls: "bg-coral", title: "Group trip sale is on", sub: "Best prices on fixed-date departures. Lock your seat before prices go back up.", cta: "Grab the deal", href: wa("I want the group trip sale price.") },
    { src: "/images/groups/mountain_viewpoint_group.jpg", tag: "Limited seats", tagCls: "bg-amber-400 text-ink", title: `Only ${seats.toLocaleString("en-IN")} seats left`, sub: `Spread across ${departures.length} upcoming departures. Small groups fill quickly.`, cta: "See dates", href: "#departures" },
    { src: "/images/groups/trekkers_waving.jpg", tag: "Hurry up", tagCls: "bg-white text-ink", title: next ? `Next group leaves ${nextDay}` : "New groups every month", sub: next ? `${next.title}, ${next.availableSeats} seat${next.availableSeats > 1 ? "s" : ""} left` : "Tell us your dates and we'll find you a group.", cta: "Book now", href: next ? wa(`I want to book "${next.title}" departing ${nextDay}.`) : "#departures" },
    { src: "/images/groups/group_photo_meadow.jpg", tag: "Travel together", tagCls: "bg-brand text-ink", title: "Come solo, leave with a crew", sub: "Join the Encamp family on the road.", cta: "Chat with us", href: wa("I'd like help choosing a group trip.") },
  ];

  return (
    <>
      <SaleTicker items={[
        "🔥 Group trip sale is live",
        `⏳ Only ${seats.toLocaleString("en-IN")} seats left`,
        ...(next ? [`🏔 Next group leaves ${nextDay}`] : []),
        "⚡ Hurry up, seats are filling fast",
        "💬 Book on WhatsApp in 2 minutes",
      ]} />

      <DepartureBrowser departures={departures}>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-5">
          <div>
            <p className="font-script text-2xl text-coral md:text-3xl -rotate-3 origin-left">Travel Together</p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight text-ink min-[360px]:text-5xl md:text-7xl">Group Trips</h1>
            <p className="mt-3 max-w-md text-base text-ink/80 md:text-lg">
              Fixed-date adventures across the Himalayas, Northeast India, Nepal and Bhutan.
            </p>
            <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5">
              {PERKS.map(([icon, title]) => (
                <li key={title} className="flex items-center gap-1.5 text-xs font-semibold text-ink md:text-sm">
                  <Icon name={icon} className="h-4 w-4 text-brand-dark" />{title}
                </li>
              ))}
            </ul>
          </div>
          <dl className="grid grid-cols-3 divide-x divide-ink/10">
            {[[departures.length, "Departures"], [trips, "Unique trips"], [seats, "Seats open"]].map(([val, label]) => (
              <div key={label} className="flex min-w-0 flex-col-reverse justify-end px-3 first:pl-0 min-[360px]:px-4 md:px-5">
                <dt className="mt-1 text-[11px] font-medium leading-tight text-muted min-[360px]:text-xs">{label}</dt>
                <dd className="text-2xl font-extrabold leading-none text-ink min-[360px]:text-3xl md:text-4xl">{val.toLocaleString("en-IN")}</dd>
              </div>
            ))}
          </dl>
        </div>
      </DepartureBrowser>

      <BannerCarousel banners={banners} />

      <section className="mx-auto max-w-7xl px-4 py-10">
        <div className="relative grid grid-cols-1 overflow-hidden rounded-3xl bg-ink text-white sm:grid-cols-[1fr_auto]">
          {/* faint ridge line across the card */}
          <svg viewBox="0 0 600 120" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full text-brand/15" fill="currentColor">
            <path d="M0 120V80l60-30 50 22 70-52 60 40 45-20 80 48 55-34 70 30 40-18 70 34v50Z" />
          </svg>
          <div className="relative p-6 sm:p-8">
            <p className="font-script text-2xl text-brand -rotate-2 origin-left">Can&apos;t find your date?</p>
            <p className="mt-1 text-2xl font-bold leading-snug sm:text-3xl">Tell us when you&apos;re free.<br />We&apos;ll find you a group.</p>
            <p className="mt-3 max-w-md text-sm text-white/70">
              Drop your dates and destination on WhatsApp. We&apos;ll ping you first when a new departure opens or a seat frees up.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={wa("I can't find a group trip on my dates. I'm free around: ")} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-full bg-brand px-6 py-3 text-sm font-bold text-ink transition hover:brightness-105">
                <Icon name="chat" /> Join the waitlist
              </a>
              <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-sm font-semibold transition hover:bg-white/10">
                <Icon name="phone" /> {PHONE}
              </a>
            </div>
          </div>
          <figure className="relative mx-auto mb-6 w-44 rotate-3 sm:w-56 rounded-md bg-white p-2 pb-0 shadow-2xl sm:m-8 sm:ml-0 sm:self-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image src="/images/groups/trekkers_waving.jpg" alt="An Encamp group waving on a mountain trail" fill sizes="224px" className="object-cover" />
            </div>
            <figcaption className="py-1.5 text-center font-script text-lg text-ink">save us a spot next time!</figcaption>
          </figure>
        </div>
      </section>
    </>
  );
}
