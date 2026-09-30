import Image from "next/image";
import Icon from "@/components/Icon";
import { MAIN_SITE, PHONE, EMAIL, SOCIALS, whatsappLink } from "@/lib/site";

// Port of the main site's NewFooter (encampmain/components/common/NewFooter.jsx); links point back to the main site.
const DESTINATIONS = ["Meghalaya", "Nepal", "Bhutan", "Assam", "Nagaland", "Mizoram", "Sikkim", "Arunachal Pradesh"];
const COMPANY = [["About Us", "/about"], ["Group Tours", "/group-tours"], ["Private Trips", "/private-trips"], ["Blogs", "/blog"], ["Contact Us", "/contactus"]];
const RESOURCES = [["Cancellation Policy", "/cancellation-policy"], ["Privacy Policy", "/privacy-policy"], ["Terms & Conditions", "/terms-and-conditions"]];
const TRUST = [["suitcase", "Local Expert", "Guides"], ["check", "Safe & Secure", "Adventures"], ["leaf", "Sustainable", "Travel"], ["star", "Handpicked", "Experiences"]];
const SEARCHES = [
  ["Meghalaya Tour Packages", "/meghalaya"],
  ["Assam Tour Packages", "/assam"],
  ["Tawang Tour Packages", "/arunachal-pradesh/itineraryv2/mystical-tawang-pvt-leisure-tour"],
  ["Anini Tour Packages", "/arunachal-pradesh/itineraryv2/anini-group-tour"],
  ["Ziro Festival Packages", "/ziro-music-fest/tour-packages"],
  ["Spiti Valley Trips", "/himachal-pradesh/itineraryv2/winter-spiti-valley-frozen-desert-expedition"],
  ["Ladakh Tours", "/ladakh"],
  ["Nepal Tour Packages", "/nepal"],
  ["Bhutan Tour Packages", "/bhutan"],
  ["Camping Near Guwahati", "/assam/accommodation"],
  ["Meghalaya Weekend Trips", "/meghalaya/itineraryv2/meghalaya-weekend-tour-packages"],
  ["India Private Tours", "/private-trips"],
  ["Group Tours India", "/group-tours"],
];
const PAYMENTS = [["visa.svg", "VISA"], ["mastercard.svg", "Mastercard"], ["upi.svg", "UPI"], ["paytm.webp", "Paytm"], ["razorpay.svg", "Razorpay"]];
const slug = (s) => s.toLowerCase().replace(/\s+/g, "-");

const Col = ({ title, children }) => (
  <div>
    <h4 className="mb-5 text-base font-bold uppercase text-[#2c4731]">{title}</h4>
    <ul className="space-y-3 text-sm text-[#334d3a]">{children}</ul>
  </div>
);
const Item = ({ icon, href, children }) => (
  <li className="flex items-center gap-2.5">
    <Icon name={icon} className="h-4 w-4 text-[#7b997c]" />
    <a href={href} className="min-w-0 transition [overflow-wrap:anywhere] hover:text-[#1f3323] hover:underline">{children}</a>
  </li>
);

export default function Footer() {
  return (
    <footer className="relative mt-10 overflow-x-clip bg-gradient-to-b from-[#f2f5ed] to-[#dce4d3] pt-8 text-[#1f3323] md:pt-16">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-36 right-0 h-full w-[900px] max-w-full bg-[url('/images/footer/footer-bg.png')] bg-contain bg-right-bottom bg-no-repeat opacity-90 mix-blend-multiply" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="mb-10 flex flex-col gap-8 lg:flex-row lg:justify-between">
          <div className="max-w-xs">
            <a href={MAIN_SITE}><Image src="/images/logo.svg" alt="Encamp Adventures" width={180} height={80} className="h-auto w-[160px]" /></a>
            <p className="mt-5 text-sm leading-relaxed text-[#334d3a]">
              We create unforgettable travel experiences across India. From hidden trails to iconic destinations, we make your adventures safe, smooth and truly memorable.
            </p>
            <div className="mt-5 flex gap-3">
              {[...SOCIALS, ["WhatsApp", whatsappLink()]].map(([name, href]) => (
                <a key={name} href={href} target="_blank" rel="noopener noreferrer" aria-label={name}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-[#a3b89e] transition hover:border-[#1f3323] hover:bg-[#1f3323] hover:text-white">
                  <Icon name={name === "WhatsApp" ? "chat" : name} className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-x-5 gap-y-8 lg:max-w-4xl lg:grid-cols-4">
            <Col title="Destinations">
              {DESTINATIONS.map((d) => <Item key={d} icon="pin" href={`${MAIN_SITE}/${slug(d)}`}>{d}</Item>)}
            </Col>
            <Col title="Company">
              {COMPANY.map(([l, p]) => <Item key={l} icon="file" href={`${MAIN_SITE}${p}`}>{l}</Item>)}
            </Col>
            <Col title="Resources">
              {RESOURCES.map(([l, p]) => <Item key={l} icon="help" href={`${MAIN_SITE}${p}`}>{l}</Item>)}
            </Col>
            <Col title="Support">
              <li className="flex items-center gap-2.5">
                <Icon name="phone" className="h-4 w-4 text-[#7b997c]" />
                <a href={`tel:${PHONE.replace(/\s/g, "")}`}><strong>{PHONE}</strong><br /><span className="text-xs">(9 AM - 10 PM)</span></a>
              </li>
              <Item icon="mail" href={`mailto:${EMAIL}`}>{EMAIL}</Item>
              <Item icon="chat" href={whatsappLink()}>Chat on WhatsApp</Item>
              <li className="flex items-start gap-2.5">
                <Icon name="pin" className="mt-1 h-4 w-4 text-[#7b997c]" />
                <address className="not-italic">Encamp Adventures<br />Guwahati, Assam<br />India - 781001</address>
              </li>
            </Col>
          </div>
        </div>

        <ul className="grid grid-cols-2 gap-6 border-y border-[#a3b89e]/40 py-7 md:grid-cols-4">
          {TRUST.map(([icon, a, b]) => (
            <li key={a} className="flex items-center gap-3.5 md:justify-center">
              <Icon name={icon} className="h-8 w-8 text-[#3f5439]" />
              <span className="flex flex-col text-sm leading-tight text-[#2c4731]"><strong>{a}</strong><span>{b}</span></span>
            </li>
          ))}
        </ul>

        <div className="border-b border-[#a3b89e]/40 py-7">
          <p className="mb-4 flex items-center gap-2.5 text-sm font-bold text-[#2c4731]"><Icon name="search" /> POPULAR SEARCHES</p>
          <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-2.5">
            {SEARCHES.map(([tag, href]) => (
              <a key={tag} href={`${MAIN_SITE}${href}`}
                className="flex min-h-10 items-center justify-center rounded-full border border-[#b5c7b1] bg-white/55 px-2 py-1.5 text-center text-xs leading-tight text-[#334d3a] transition hover:border-[#5c7554] hover:bg-white sm:min-h-0 sm:rounded sm:bg-white/30 sm:px-3">
                {tag}
              </a>
            ))}
          </div>
        </div>

        {/* Mobile keeps extra bottom room for the fixed tab bar. */}
        <div className="-mx-4 flex flex-col items-center gap-5 bg-white/75 px-4 pb-24 pt-6 text-center backdrop-blur-sm md:mx-0 md:flex-row md:justify-between md:bg-transparent md:px-0 md:pb-6 md:text-left md:backdrop-blur-none">
          <div className="flex flex-col gap-1 text-sm text-[#334d3a]">
            <span>© {new Date().getFullYear()} Encamp Adventures</span>
            <span>Made with <span className="text-[#d9534f]">❤️</span> in India</span>
          </div>
          <div className="flex items-center gap-5">
            <Image src="/images/footer/msme.png" alt="MSME Registered" width={75} height={40} className="h-10 w-[75px] rounded bg-white object-contain p-1" />
            <span className="flex items-center gap-2 text-xs font-semibold"><Icon name="shield" className="h-6 w-6 text-[#3f5439]" />Safe<br />Travel</span>
          </div>
          <div className="flex flex-col items-center gap-2 text-[13px] font-semibold md:flex-row md:gap-4">
            <span>We Accept</span>
            <div className="flex flex-wrap justify-center gap-1.5 md:gap-2.5">
              {PAYMENTS.map(([f, alt]) => (
                <Image key={f} src={`/images/footer/${f}`} alt={alt} width={60} height={32}
                  className="h-6 w-[42px] rounded bg-white object-contain px-1 py-0.5 shadow-sm md:h-8 md:w-[60px] md:px-1.5 md:py-1" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
