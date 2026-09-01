import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const dm = DM_Sans({
  variable: "--font-dm",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrument = Instrument_Serif({
  variable: "--font-instrument",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "AccessMyLand — Third-party land access for infrastructure",
    template: "%s · AccessMyLand",
  },
  description:
    "The operating system for obtaining third-party land access. Negotiate compensation, generate licences, evidence visits and outsource cases to independent land agents.",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en-GB"
      className={`${dm.variable} ${instrument.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-paper text-ink">
        <StoreProvider>{children}</StoreProvider>
      </body>
    </html>
  );
}
