import localFont from "next/font/local";

export const light = localFont({
    src: [{ path: "./fonts/InterTight-Light.ttf" }],
    variable: "--font-light"
});

export const regular = localFont({
    src: [{ path: "./fonts/InterTight-Regular.ttf" }],
    variable: "--font-regular"
});

export const medium = localFont({
    src: [{ path: "./fonts/InterTight-Medium.ttf" }],
    variable: "--font-medium"
});

export const semibold = localFont({
    src: [{ path: "./fonts/InterTight-SemiBold.ttf" }],
    variable: "--font-semibold"
});

export const bold = localFont({
    src: [{ path: "./fonts/InterTight-Bold.ttf" }],
    variable: "--font-bold"
});