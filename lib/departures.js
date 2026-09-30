import { MAIN_SITE } from "./site";

const REVALIDATE = 300; // seat counts refresh every 5 min

async function get(path) {
  try {
    const res = await fetch(`${process.env.API_URL}${path}`, {
      headers: process.env.API_TOKEN ? { Authorization: `Bearer ${process.env.API_TOKEN}` } : {},
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const data = json?.data ?? json;
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const groupTier = (t) => {
  const tiers = t.startingFrom || [];
  return tiers.find((s) => s.type === "Group") || tiers[0] || {};
};

const titleCase = (s = "") => s.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// ponytail: one calendar call per trip because /itineraryv2/upcoming-grouptrips returns [] today;
// switch to that single endpoint once the backend fills it.
export async function getDepartures() {
  const trips = (await get("/itineraryv2?isclientvisible=true")).filter((t) => t.tripTypeGroup === "Group");
  const today = new Date().toISOString().slice(0, 10);

  const perTrip = await Promise.all(
    trips.map(async (t) => {
      const days = await get(`/itineraryv2/${t._id}/calendar`);
      const trip = {
        id: t._id,
        title: t.title || "",
        state: titleCase(t.state),
        days: t.duration?.days || 0,
        nights: t.duration?.nights || 0,
        image: t.images?.[0] || "/images/hero.jpg",
        // totalPricePerPerson is the "Starting from" price the main site shows.
        price: groupTier(t).totalPricePerPerson || groupTier(t).pricePerPerson || null,
        subtitle: t.subtitle || "",
        route: t.locations || [],
        difficulty: t.adventureType || "",
        tripType: t.tripType || "",
        groupSize: (groupTier(t).people || "").replace(/ to /, "–"),
        photos: t.images || [],
        url: `${MAIN_SITE}${t.complete_url || `/${t.state}/itineraryv2/${t.slug}`}`,
      };
      return days
        .map((d) => ({ ...d, date: String(d.date || "").slice(0, 10) })) // some dates come as full ISO timestamps
        .filter((d) => /^\d{4}-\d{2}-\d{2}$/.test(d.date) && d.date >= today)
        .map((d) => ({
          ...trip,
          key: `${t._id}-${d.date}`,
          date: d.date,
          label: d.heading || "",
          offer: d.subheading?.trim() || "",
          totalSeats: d.totalSeats ?? 0,
          availableSeats: d.availableSeats ?? 0,
        }));
    })
  );

  return perTrip.flat().sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
}
