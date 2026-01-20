import type { Metadata } from "next";
import "./globals.css";
import HeaderBar from "@/app/components/HeaderBar/HeaderBar";

export const metadata: Metadata = {
  title: "Mono",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <HeaderBar/>
        {children}
      </body>
    </html>
  );
}
