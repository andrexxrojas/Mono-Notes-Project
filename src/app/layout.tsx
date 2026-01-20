import type { Metadata } from "next";
import "./globals.css";
import { light, regular, medium, semibold, bold } from "./fonts";
import styles from "./layout.module.css";
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
    <html
        lang="en"
        className={`${light.variable} ${regular.variable} ${medium.variable} ${semibold.variable} ${bold.variable}`}
    >
      <body>
        <HeaderBar/>
        <main className={styles["main-container"]}>
            {children}
        </main>
      </body>
    </html>
  );
}
