import "./globals.css";
import React from "react";
import type { Metadata } from "next";
import { light, regular, medium, semibold, bold } from "./fonts";
import SideBarWrapper from "@/app/components/SideBarWrapper/SideBarWrapper";

export const metadata: Metadata = {
  title: "Mono",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
        lang="en"
        className={`${light.variable} ${regular.variable} ${medium.variable} ${semibold.variable} ${bold.variable}`}
    >
      <body>
        <SideBarWrapper>
          {children}
        </SideBarWrapper>
      </body>
    </html>
  );
}
