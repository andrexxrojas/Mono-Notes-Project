"use client";

import { getCurrentWindow } from "@tauri-apps/api/window";
import { XIcon, MinusIcon, SquareIcon, SidebarSimpleIcon } from "@phosphor-icons/react";
import styles from "./HeaderBar.module.css";

export default function HeaderBar() {
    const appWindow = getCurrentWindow();

    const minimize = async () => await appWindow.minimize();
    const maximize = async () => await appWindow.toggleMaximize();
    const close = async () => await appWindow.close();

    return (
        <div className={styles["title-bar"]} data-tauri-drag-region>

            <div className={styles["branding"]}>
                <h4 className={styles["application-name"]}>Mono</h4>
                <button className={`${styles["btn"]} ${styles["sidebar"]}`}>
                    <SidebarSimpleIcon size={14} />
                </button>
            </div>

            <div className={styles["controls"]}>
                <button className={`${styles["window-btn"]} ${styles["minimize"]}`} onClick={minimize}>
                    <MinusIcon size={14} />
                </button>
                <button className={`${styles["window-btn"]} ${styles["maximize"]}`} onClick={maximize}>
                    <SquareIcon size={13} />
                </button>
                <button className={`${styles["window-btn"]} ${styles["close"]}`} onClick={close}>
                    <XIcon size={17} />
                </button>
            </div>
        </div>
    );
}
