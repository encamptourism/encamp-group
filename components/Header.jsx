import Image from "next/image";
import Icon from "@/components/Icon";
import { MAIN_SITE, PHONE, whatsappLink } from "@/lib/site";

// [label, href, tab-bar icon, is this site]
const NAV = [
  ["Home", MAIN_SITE, "home"],
  ["Group Tours", `${MAIN_SITE}/group-tours`, "users", true],
  ["Private Trips", `${MAIN_SITE}/private-trips`, "mountain"],
  ["Blogs", `${MAIN_SITE}/blog`, "book"],
  ["Contact", `${MAIN_SITE}/contactus`, "mail"],
];

export default function Header() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4">
          <a href={MAIN_SITE} className="shrink-0">
            <Image src="/images/logo-dark.svg" alt="Encamp Adventures" width={98} height={48} priority />
          </a>

          <nav className="mx-auto hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV.map(([label, href, , active]) => (
              <a key={label} href={href} aria-current={active ? "page" : undefined}
                className={`relative py-5 transition-colors ${active ? "text-brand-dark after:absolute after:inset-x-0 after:bottom-3 after:h-0.5 after:rounded-full after:bg-brand-dark" : "text-ink/80 hover:text-ink"}`}>
                {label}
              </a>
            ))}
          </nav>

          <a href={`tel:${PHONE.replace(/\s/g, "")}`} className="ml-auto md:ml-0 hidden lg:flex items-center gap-2 text-sm font-medium text-ink">
            <Icon name="phone" /> {PHONE}
          </a>
          <a href={whatsappLink("Hi Encamp, I want to join a group trip")} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp"
            className="ml-auto lg:ml-0 flex h-10 w-10 items-center justify-center rounded-full bg-brand text-white shadow-md shadow-brand/30 transition hover:brightness-95">
            <Icon name="chat" className="h-5 w-5" />
          </a>

          {/* native disclosure keeps the mobile menu JS-free */}
          <details className="relative md:hidden">
            <summary aria-label="Menu" className="flex h-10 w-10 cursor-pointer list-none items-center justify-center text-ink [&::-webkit-details-marker]:hidden">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
            </summary>
            <nav className="absolute right-0 top-12 w-52 rounded-2xl border border-line bg-white p-2 shadow-xl">
              {NAV.map(([label, href]) => (
                <a key={label} href={href} className="block rounded-xl px-3 py-2.5 text-sm font-medium text-ink hover:bg-mint">{label}</a>
              ))}
            </nav>
          </details>
        </div>
      </header>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        {NAV.map(([label, href, icon, active]) => (
          <a key={label} href={href} aria-current={active ? "page" : undefined}
            className={`flex h-16 min-w-0 flex-col items-center justify-center gap-1 whitespace-nowrap text-[10px] font-medium min-[360px]:text-[11px] ${active ? "text-brand-dark font-semibold" : "text-muted"}`}>
            <Icon name={icon} className="h-5 w-5" />
            {active ? "Group Trips" : label}
          </a>
        ))}
      </nav>
    </>
  );
}
