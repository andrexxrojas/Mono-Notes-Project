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
                {/* APPLICATION NAME OR ICON TO BE ADDED */}
                <button className={`${styles["btn"]} ${styles["sidebar"]}`}>
                    <SidebarSimpleIcon size={20} />
                </button>
            </div>

            <div className={styles["controls"]}>
                <button className={`${styles["window-btn"]} ${styles["minimize"]}`} onClick={minimize}>
                    <MinusIcon size={13} />
                </button>
                <button className={`${styles["window-btn"]} ${styles["maximize"]}`} onClick={maximize}>
                    <SquareIcon size={12} />
                </button>
                <button className={`${styles["window-btn"]} ${styles["close"]}`} onClick={close}>
                    <XIcon size={15} />
                </button>
            </div>
        </div>
    );
}
