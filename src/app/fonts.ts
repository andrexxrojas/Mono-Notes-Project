import localFont from "next/font/local";

export const light = localFont({
    src: [{ path: "./fonts/Manrope-Light.woff2" }],
    variable: "--font-light"
});

export const regular = localFont({
    src: [{ path: "./fonts/Manrope-Regular.woff2" }],
    variable: "--font-regular"
});

export const medium = localFont({
    src: [{ path: "./fonts/Manrope-Medium.woff2" }],
    variable: "--font-medium"
});

export const semibold = localFont({
    src: [{ path: "./fonts/Manrope-SemiBold.woff2" }],
    variable: "--font-semibold"
});

export const bold = localFont({
    src: [{ path: "./fonts/Manrope-Bold.woff2" }],
    variable: "--font-bold"
});