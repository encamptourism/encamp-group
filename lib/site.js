export const MAIN_SITE = process.env.NEXT_PUBLIC_MAIN_SITE || "https://encampadventures.com";
export const PHONE = "+91 96431 82259";
export const EMAIL = "info@encampadventures.com";

export const whatsappLink = (text) =>
  `https://api.whatsapp.com/send?phone=919643182259${text ? `&text=${encodeURIComponent(text)}` : ""}`;

export const SOCIALS = [
  ["Instagram", "https://www.instagram.com/encampadventures/"],
  ["Facebook", "https://www.facebook.com/encampadventures"],
  ["YouTube", "https://www.youtube.com/@encampadventures"],
  ["LinkedIn", "https://www.linkedin.com/company/encampadventures/"],
];
