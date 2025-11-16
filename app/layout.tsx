import type { Metadata } from "next";
import { Karla } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const karla = Karla({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Event Manager",
  description: "Manage your events and RSVPs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={karla.className}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
