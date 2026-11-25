import type { Metadata } from "next";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import { StoreProvider } from "./data/StoreProvider";
import { CurrencyProvider } from "./data/CurrencyProvider";
import SeoManager from "./components/SeoManager";

export const metadata: Metadata = {
  title: "UM-AREX | Premium Luxury Watches",
  description: "Discover curated watches at UM-AREX with worldwide delivery, confirmed shipping charges, and personal WhatsApp service.",
  keywords: ["luxury watches", "automatic watches", "UM-AREX", "premium watches", "worldwide watch delivery"],
  icons: {
    icon: [
      { url: "/icon.png", sizes: "512x512", type: "image/png" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon.ico"],
  },
  authors: [{ name: "UM-AREX" }],
  openGraph: {
    title: "UM-AREX | Premium Luxury Watches",
    description: "Discover curated watches with worldwide delivery and confirmed shipping charges.",
    type: "website",
    locale: "en_PK",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <StoreProvider>
          <CurrencyProvider>
            <div className="grain-overlay" />
            <SeoManager />
            <ScrollToTop />
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </CurrencyProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
