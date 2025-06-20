import type { Metadata } from "next";
import "./globals.css";


export const metadata: Metadata = {
  title: "PromX",
  description: "Generated by create next app",
  icons: {
    icon: '/boltimages-removebg-preview(1).png', // or .png/.webp etc.
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
