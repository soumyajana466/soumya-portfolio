// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://soumyajana.in";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Soumya Jana | Software Engineer & Backend Developer",
  description:
    "Portfolio of Soumya Jana, Software Engineer specializing in backend architecture, Node.js, Express, REST APIs, and SQL database design.",
  keywords: [
    "Soumya Jana",
    "Software Engineer",
    "Backend Developer",
    "Node.js Developer",
    "Express.js",
    "SQL",
    "PostgreSQL",
    "REST APIs",
    "Backend Engineer",
    "Database Schema Design",
  ],
  authors: [{ name: "Soumya Jana", url: siteUrl }],
  creator: "Soumya Jana",
  publisher: "Soumya Jana",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    title: "Soumya Jana | Software Engineer & Backend Developer",
    description:
      "Explore the backend engineering projects, database designs, and scalable REST APIs built by Soumya Jana.",
    siteName: "Soumya Jana Portfolio",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Soumya Jana | Software Engineer & Backend Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Soumya Jana | Software Engineer & Backend Developer",
    description:
      "Explore the backend engineering projects, database designs, and scalable REST APIs built by Soumya Jana.",
    creator: "@soumyajana466",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
