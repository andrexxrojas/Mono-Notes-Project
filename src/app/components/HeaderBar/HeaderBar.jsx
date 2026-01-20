"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { XIcon, MinusIcon, SquareIcon } from "@phosphor-icons/react";
import styles from "./HeaderBar.module.css";

export default function HeaderBar() {
    // get the current Tauri window
    const appWindow = getCurrentWindow();

    const minimize = async () => await appWindow.minimize();
    const maximize = async () => await appWindow.toggleMaximize();
    const close = async () => await appWindow.close();

    return (
        <div className={styles["title-bar"]}>
            <div data-tauri-drag-region></div>

            <div className={styles["controls"]}>
                <button className={`${styles["btn"]} ${styles["minimize"]}`} onClick={minimize}>
                    <MinusIcon size={14} />
                </button>
                <button className={`${styles["btn"]} ${styles["maximize"]}`} onClick={maximize}>
                    <SquareIcon size={13} />
                </button>
                <button className={`${styles["btn"]} ${styles["close"]}`} onClick={close}>
                    <XIcon size={17} />
                </button>
            </div>
        </div>
    );
}
