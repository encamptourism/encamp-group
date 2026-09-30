import { Caveat, Poppins } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"], weight: "600" });

export const metadata = {
  title: "Group Trips by Date | Encamp Adventures",
  description:
    "Pick a date and join an Encamp group trip across Northeast India, Himachal, Nepal and Bhutan. See upcoming departures and live seat availability.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${caveat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
