import type { Metadata, Viewport } from "next";
import { Karla } from "next/font/google";
import "./globals.css";

const karla = Karla({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event Solutions by Krutik Parikh - Smart Event Management",
  description: "Custom event management solutions, smart RSVP tracking, and AI-powered photo albums. Everything you need for a perfect event.",
  keywords: [
    "Event Management",
    "RSVP System",
    "Event Planning",
    "Photo Albums",
    "AI Photo Recognition",
    "Guest Management",
    "Wedding Planning",
    "Event Solutions"
  ],
  authors: [{ name: "Krutik Parikh" }],
  creator: "Krutik Parikh",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://events.krutikparikh.ca",
    title: "Event Solutions by Krutik Parikh",
    description: "Custom event management solutions, smart RSVP tracking, and AI-powered photo albums.",
    siteName: "Event Solutions by Krutik Parikh",
  },
  twitter: {
    card: "summary_large_image",
    title: "Event Solutions by Krutik Parikh",
    description: "Custom event management solutions, smart RSVP tracking, and AI-powered photo albums.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={karla.className}>
        {children}
      </body>
    </html>
  );
}
